import { Link } from '@tanstack/react-router';
import { Breadcrumb, BreadcrumbButton, BreadcrumbList, BreadcrumbSeparator } from '../selia/breadcrumb';

type AppBreadCrumbProps = {
  list: BreadCrumbList;
};

export default function AppBreadCrumb({ list }: AppBreadCrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className='text-sm'>
        {list.items.map((item, index) => (
          <Link key={index} to={item.to}>
            <BreadcrumbButton active={item.active}>{item.label}</BreadcrumbButton>
            {index < list.items.length - 1 && <BreadcrumbSeparator />}
          </Link>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
