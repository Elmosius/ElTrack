type BreadCrumbList = {
  items: BreadCrumbItem[];
};

type BreadCrumbItem = {
  label: string;
  to?: string;
  active?: boolean;
};
