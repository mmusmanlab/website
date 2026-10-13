import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact & Project Inquiries — Muhammad M. Usman",
  description:
    "Discuss your software project with Muhammad M. Usman. Available for web and mobile development, contract software engineering, and technical consulting in Next.js, React Native, TypeScript, and Node.js.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact & Project Inquiries — Muhammad M. Usman",
    description:
      "Discuss your software project with Muhammad M. Usman. Available for web and mobile application development and technical consulting.",
    url: "https://mmusmanlab.vercel.app/contact",
    type: "website",
  },
};

export default function ContactPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Muhammad M. Usman",
    url: "https://mmusmanlab.vercel.app/contact",
    description: "Inquiry and contact page for software engineering collaboration with Muhammad M. Usman.",
    mainEntity: {
      "@type": "Person",
      name: "Muhammad M. Usman",
      email: "mailto:mmusmanlab@gmail.com",
      jobTitle: "Full-Stack Software Engineer",
      url: "https://mmusmanlab.vercel.app/about",
    },
  };

  return (
    <>
      <ContactForm />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}