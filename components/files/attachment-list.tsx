export type Attachment = {
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
};

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Uploaded by</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {attachments.map((attachment) => (
          <tr key={attachment.name}>
            <td>{attachment.name}</td>
            <td>{attachment.type}</td>
            <td>{attachment.uploadedBy}</td>
            <td>{attachment.uploadedAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

