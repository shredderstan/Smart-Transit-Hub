import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-24 text-center">
      <p className="text-base font-semibold text-indigo-600">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Route Does Not Exist
      </h1>
      <p className="mt-6 text-base leading-7 text-gray-600">
        The URL path you entered could not be resolved.
      </p>
      <div className="mt-10">
        <Link
          to="/"
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
