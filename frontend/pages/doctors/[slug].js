export default function DoctorProfile() {
  return null;
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: false,
  };
}

export async function getStaticProps() {
  return {
    notFound: true,
  };
}