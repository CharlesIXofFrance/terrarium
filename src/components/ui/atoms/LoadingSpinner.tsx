export function LoadingSpinner() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-50"
      role="status"
      aria-label="Loading application"
    >
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
          role="progressbar"
          aria-label="Loading indicator"
        />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
