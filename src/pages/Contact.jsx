import { useRef } from 'react';
import useReveal from '../lib/useReveal';
import ContactCta from '../components/ContactCta';

export default function Contact() {
  const root = useRef(null);
  useReveal(root);
  return (
    <div ref={root} className="contact-page">
      <ContactCta />
    </div>
  );
}
