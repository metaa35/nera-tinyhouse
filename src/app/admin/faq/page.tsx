"use client";
import { useEffect, useState } from "react";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId !== null) {
      // Düzenleme
      const res = await fetch("/api/faq", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, question, answer }),
      });
      const updated = await res.json();
      setFaqs(faqs.map(f => f.id === editId ? updated.faq : f));
      setEditId(null);
    } else {
      // Ekleme
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      setFaqs([...faqs, data.faq]);
    }
    setQuestion("");
    setAnswer("");
    setLoading(false);
  };

  const handleEdit = (faq: Faq) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu SSS kaydını silmek istediğinize emin misiniz?")) return;
    await fetch("/api/faq", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setFaqs(faqs.filter(f => f.id !== id));
    setEditId(null);
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">SSS Yönetimi</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-10 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block font-medium mb-1">Soru</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Cevap</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-[#FF6B6B] text-white rounded hover:bg-[#ff5252] transition"
          disabled={loading}
        >
          {editId !== null ? "Kaydet" : "Ekle"}
        </button>
        {editId !== null && (
          <button
            type="button"
            className="ml-4 px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            onClick={() => {
              setEditId(null);
              setQuestion("");
              setAnswer("");
            }}
          >
            İptal
          </button>
        )}
      </form>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold text-[#FF6B6B]">{faq.question}</div>
              <div className="text-gray-700">{faq.answer}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={() => handleEdit(faq)}
              >
                Düzenle
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => handleDelete(faq.id)}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 