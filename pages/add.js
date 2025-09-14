import { useState } from "react";

export default function AddAd() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("سيارات");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/saveAd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, desc, price, category }),
    });

    if (res.ok) {
      alert("تم إضافة الإعلان بنجاح!");
      setTitle(""); setDesc(""); setPrice("");
    } else {
      alert("حصل خطأ أثناء الإضافة");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>إضافة إعلان جديد</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>العنوان:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>الوصف:</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required />
        </div>
        <div>
          <label>السعر:</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label>التصنيف:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>سيارات</option>
            <option>عقارات</option>
            <option>إلكترونيات</option>
            <option>وظائف</option>
            <option>أخرى</option>
          </select>
        </div>
        <button type="submit">نشر الإعلان</button>
      </form>
    </div>
  );
}
