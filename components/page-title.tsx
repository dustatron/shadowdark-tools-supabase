type PageTitleProps = {
  title: string;
};
export function PageTitle({ title }: PageTitleProps) {
  return (
    <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">
      {title}
    </h1>
  );
}
