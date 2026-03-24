import { useState, useEffect } from 'react';

interface QuickNote {
    id: number;
    title: string;
    content: string;
}

export function QuickNotes() {
    const [notes, setNotes] = useState<QuickNote[]>([]);
    const [loading, setLoading] =useState(true);

    useEffect(() => {
        async function fetchNotes() {
            try {
                const tempToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc3MzA3NzQ0MSwiZXhwIjoxNzczNjgyMjQxfQ.5kg1yYnvyhmQ989W8ZpYqV7hy33KbrRjcPT2b2eVNHk";

                const response = await fetch('http://localhost:3333/quickNotes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tempToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setNotes(data.data);
                } else {
                    console.error("Erro ao buscar notas:", response.status);
                }
            } catch (error) {
                console.error("Erro de rede:", error);
            } finally {
                setLoading(false)
            }
        }

        fetchNotes();
    }, [])

    return (
    <div className="bg-neutral-200 border-2 border-neutral-800 rounded-3xl p-6 lg:col-span-1 shadow-sm">
      <h2 className="text-lg font-medium mb-4 text-center">Notas</h2>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-center text-neutral-500">Carregando...</div>
        ) : notes.length === 0 ? (
          <div className="text-sm text-center text-neutral-500">Nenhuma nota encontrada.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="text-sm p-2 hover:bg-neutral-300 rounded cursor-pointer transition">
              - {note.title}
            </div>
          ))
        )}
      </div>
    </div>
  );
}