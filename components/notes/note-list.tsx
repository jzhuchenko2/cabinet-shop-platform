export type NoteItem = {
  body: string;
  author: string;
  noteType: string;
  createdAt: string;
};

export function NoteList({ notes }: { notes: NoteItem[] }) {
  return (
    <div className="grid">
      {notes.map((note) => (
        <article className="card" key={`${note.author}-${note.createdAt}`}>
          <p>{note.body}</p>
          <p className="muted">
            {note.noteType} by {note.author} on {note.createdAt}
          </p>
        </article>
      ))}
    </div>
  );
}

