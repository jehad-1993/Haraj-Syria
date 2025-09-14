import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    const filePath = path.join(process.cwd(), "public/data/ads.json");
    let ads = [];

    if (fs.existsSync(filePath)) {
      ads = JSON.parse(fs.readFileSync(filePath));
    }

    ads.push(req.body);

    fs.writeFileSync(filePath, JSON.stringify(ads, null, 2));
    res.status(200).json({ message: "تم الحفظ" });
  } else {
    res.status(405).json({ message: "غير مسموح" });
  }
}
