                                                                            export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 text-lg font-medium">Hold on, Loading your page...</p>
    </div>
  );
}
