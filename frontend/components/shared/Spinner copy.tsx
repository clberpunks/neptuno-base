export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-full min-h-[100px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
