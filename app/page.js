import { redirect } from 'next/navigation'

// Temporary: the harm reduction overview is the homepage for now.
// A proper homepage for the new project gets designed in its own chat.
export default function Home() {
  redirect('/harm-reduction')
}