import React from 'react';

const SimpleFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-4">
      <div className="container mx-auto px-4 text-center text-sm">
        &copy; {new Date().getFullYear()} Grey Silicon. All rights reserved.
      </div>
    </footer>
  );
};

export default SimpleFooter;
