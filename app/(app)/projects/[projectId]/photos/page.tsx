import { PageHeader } from "@/components/ui/page-header";

const photos = [
  { caption: "Before demo", uploadedBy: "Morgan" },
  { caption: "Site measurement reference", uploadedBy: "Taylor" },
  { caption: "Finish sample", uploadedBy: "Taylor" }
];

export default function ProjectPhotosPage({ params }: { params: { projectId: string } }) {
  return (
    <>
      <PageHeader
        eyebrow="Photos"
        title="Project photos"
        description={`Photo references and jobsite images for project ${params.projectId}.`}
      />
      <section className="grid grid-3">
        {photos.map((photo) => (
          <article className="card" key={photo.caption}>
            <div
              aria-hidden="true"
              style={{
                background: "#d9dfd6",
                borderRadius: 6,
                height: 160,
                marginBottom: 12
              }}
            />
            <h3>{photo.caption}</h3>
            <p className="muted">Uploaded by {photo.uploadedBy}</p>
          </article>
        ))}
      </section>
    </>
  );
}

