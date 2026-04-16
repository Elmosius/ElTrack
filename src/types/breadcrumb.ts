export type BreadCrumbList = {
  items: BreadCrumbItem[];
};

export type BreadCrumbItem = {
  label: string;
  to?: string;
  active?: boolean;
};
