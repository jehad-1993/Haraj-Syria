import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* الهيدر */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">حراج سوريا</h1>
        <Link
          href="/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة إعلان
        </Link>
      </header>

      {/* محتوى الصفحة */}
      <p className="text-gray-600">لا توجد إعلانات حالياً.</p>
    </div>
  );
}
