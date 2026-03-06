import SectionHeading from "@/components/ui/SectionHeading";
import ContactStage from "@/sections/contact/ContactStage";

export default function ContactPage() {
  return (
    <>
      <section className="section-space-tight">
        <div className="shell">
          <SectionHeading
            eyebrow="Contact Me"
            title={
              <>
                프로젝트의 감도와 목적을
                <br />
                함께 정리하는 첫 대화.
              </>
            }
            description="편하게 문의를 남기면 됩니다. 정리되지 않은 아이디어여도 괜찮고, 원하는 분위기나 방향부터 함께 맞춰갈 수 있습니다."
          />
        </div>
      </section>
      <ContactStage />
    </>
  );
}
