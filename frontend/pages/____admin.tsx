// frontend/pages/admin.tsx
import { GetServerSideProps } from "next";

export default function AdminPage() {
  return <div>Panel admin (Sólo accesible a rol=admin)</div>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = ctx.req.headers.cookie;
  if (!cookies) {
    return { redirect: { destination: "/", permanent: false } };
  }

  // Parse cookies manually
  const cookieObj = cookies.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as { [key: string]: string });

  const raw = cookieObj.user_info;
  if (!raw) {
    return { redirect: { destination: "/", permanent: false } };
  }

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    return { redirect: { destination: "/", permanent: false } };
  }

  if (user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: { } };
};
