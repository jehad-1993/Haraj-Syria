import Link from "next/link";
import ads from "../public/data/ads.json";

export default function Home() {
  const categories = ["سيارات", "عقارات", "إلكترونيات", "وظائف", "أخرى"];

  return (
    <div style={{ padding: 20 }}>
      <h1>حراج سوريا</h1>
      <h2>التصنيفات</h2>
      <ul>
        {categories.map((cat, i) => (
          <li key={i}>{cat}</li>
        ))}
      </ul>

      <h2>الإعلانات المضافة</h2>
      {ads.length === 0 && <p>لا يوجد إعلانات بعد</p>}
      <ul>
        {ads.map((ad, i) => (
          <li key={i}>
            <Link href={`/ad/${i}`}>{ad.title} - {ad.price} ريال</Link>
          </li>
        ))}
      </ul>

      <Link href="/add">+ إضافة إعلان</Link>
    </div>
  );
}
