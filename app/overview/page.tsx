import Link from 'next/link';
import { SelectedCategory } from '../SelectedCategory';

export const instant = false;

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = ['A', 'B', 'C'];

  return (
    <>
      <ul>
        {categories.map(cat => {
          return (
            <li key={cat}>
              <Link href={`/overview?category=${cat}`}>
                {cat}                  
              </Link>
            </li>
          );
        })}
      </ul>
      <span>Category (via await searchParams): {category}</span>
      <br/>
      <SelectedCategory/>
    </>
  );
}
