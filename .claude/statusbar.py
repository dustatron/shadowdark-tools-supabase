#!/usr/bin/env python3
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime

# Constant
CONTEXT_LIMIT = int(200000 * 0.78)  # CC triggers /compact at ~78% context utilization

SOUND_FX_FILE_1 = "~/.claude/sound-effects/alert24.mp3"
SOUND_FX_FILE_2 = "~/.claude/sound-effects/alert02.mp3"
VERSION_FILE = "~/.claude/version_check_cache"

# Read JSON from stdin
data = json.load(sys.stdin)

# Extract values
model = data["model"]["display_name"]
model_id = data["model"]["id"]
current_dir = os.path.basename(data["workspace"]["current_dir"])
session_id = data["session_id"]
version = data["version"]

# Check for git branch
git_branch = ""
if os.path.exists(".git"):
    try:
        with open(".git/HEAD", "r") as f:
            ref = f.read().strip()
            if ref.startswith("ref: refs/heads/"):
                git_branch = f" |⚡️ {ref.replace('ref: refs/heads/', '')}"
    except Exception:
        pass


transcript_path = data["transcript_path"]

# Parse transcript file to calculate context usage
context_used_token = 0

try:
    with open(transcript_path, "r") as f:
        lines = f.readlines()

        # Iterate from last line to first line
        for line in reversed(lines):
            line = line.strip()
            if not line:
                continue

            try:
                obj = json.loads(line)

                # Check if this line contains the required token usage fields
                if (
                    obj.get("type") == "assistant"
                    and "message" in obj
                    and "usage" in obj["message"]
                    and all(
                        key in obj["message"]["usage"]
                        for key in [
                            "input_tokens",
                            "cache_creation_input_tokens",
                            "cache_read_input_tokens",
                            "output_tokens",
                        ]
                    )
                ):
                    usage = obj["message"]["usage"]
                    input_tokens = usage["input_tokens"]
                    cache_creation_input_tokens = usage["cache_creation_input_tokens"]
                    cache_read_input_tokens = usage["cache_read_input_tokens"]
                    output_tokens = usage["output_tokens"]

                    context_used_token = (
                        input_tokens
                        + cache_creation_input_tokens
                        + cache_read_input_tokens
                        + output_tokens
                    )
                    break

            except json.JSONDecodeError:
                # Skip malformed JSON lines
                continue

except FileNotFoundError:
    # If transcript file doesn't exist, keep context_used_token as 0
    pass

context_used_rate = (context_used_token / CONTEXT_LIMIT) * 100

# Play sound if context reaches 90% or 100%
if context_used_rate == 100:
    sound_file = os.path.expanduser(SOUND_FX_FILE_1)
    if os.path.exists(sound_file):
        try:
            subprocess.Popen(
                ["afplay", sound_file],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            pass  # Silently fail if sound can't be played
elif context_used_rate == 95:
    sound_file = os.path.expanduser(SOUND_FX_FILE_2)
    if os.path.exists(sound_file):
        try:
            subprocess.Popen(
                ["afplay", sound_file],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            pass  # Silently fail if sound can't be played

# Create progress bar
bar_length = 20
filled_length = int(bar_length * context_used_token // CONTEXT_LIMIT)
bar = "█" * filled_length + "░" * (bar_length - filled_length)
# Color codes
RESET = "\033[0m"
BOLD = "\033[1m"
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
ORANGE = "\033[38;5;208m"
RED = "\033[91m"
CYAN = "\033[96m"
BRIGHT_CYAN = "\033[1;37m"  # Bright white for dark mode
MAGENTA = "\033[95m"
WHITE = "\033[97m"
GRAY = "\033[90m"
LIGHT_GRAY = "\033[37m"


def check_claude_version(current_version):
    """Check if there's a newer version of Claude Code available"""
    try:
        # Try to get latest version from GitHub API
        req = urllib.request.Request(
            "https://api.github.com/repos/anthropics/claude-code/releases/latest",
            headers={"User-Agent": "claude-status-line"},
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            latest_version = data.get("tag_name", "").lstrip("v")

            if not latest_version:
                return "current"

            # Simple version comparison for semantic versioning
            def version_to_tuple(v):
                return tuple(map(int, v.split(".")[:3]))

            try:
                current_tuple = version_to_tuple(current_version.lstrip("v"))
                latest_tuple = version_to_tuple(latest_version)

                if current_tuple < latest_tuple:
                    return "outdated"
                else:
                    return "current"
            except ValueError:
                return "current"

    except (
        urllib.error.URLError,
        urllib.error.HTTPError,
        json.JSONDecodeError,
        Exception,
    ):
        # If we can't check, assume current version is fine
        return "current"


def get_version_status(version):
    """Get version status with caching"""
    version_check_file = os.path.expanduser(VERSION_FILE)
    check_interval = 3600  # Check every hour

    try:
        # Check if cache file exists and is recent
        if os.path.exists(version_check_file):
            file_mtime = os.path.getmtime(version_check_file)
            current_time = time.time()

            if current_time - file_mtime < check_interval:
                # Use cached result
                with open(version_check_file, "r") as f:
                    return f.read().strip()

        # Time to check for updates
        status = check_claude_version(version)

        # Cache the result
        os.makedirs(os.path.dirname(version_check_file), exist_ok=True)
        with open(version_check_file, "w") as f:
            f.write(status)

        return status

    except Exception:
        return "current"


# Get version status and format display
version_status = get_version_status(version)

if version_status == "outdated":
    version_color = ORANGE
else:
    version_color = GREEN

# Session ID (first 8 characters)
session_short = session_id[:8]

# Color the progress bar based on usage percentage
if context_used_rate < 50:
    bar_color = GREEN
elif context_used_rate < 80:
    bar_color = YELLOW
elif context_used_rate < 90:
    bar_color = ORANGE
else:
    bar_color = RED

context_usage = f" | [{bar_color}{bar}{RESET}] {bar_color}{context_used_rate:.1f}%{RESET} ({CYAN}{context_used_token:,}{RESET})"

# Get current timestamp
current_time = datetime.now().strftime("%H:%M:%S")

# Build comprehensive status line
print(
    f"📁 {BRIGHT_CYAN}{current_dir}{RESET}{GREEN}{git_branch}{RESET} {GRAY}|{RESET} {BOLD}[{MAGENTA}{model}{RESET}{BOLD}]{RESET}{context_usage} {GRAY}|{RESET} {WHITE}{session_short}{RESET} {GRAY}|{RESET} {version_color}{version} ({version_status}){RESET} {GRAY}|{RESET} {WHITE}{current_time}{RESET}"
)
