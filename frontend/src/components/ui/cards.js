import React from 'react';

const Card = ({ children }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => {
  return (
    <div className="border-b pb-2 mb-2">
      {children}
    </div>
  );
};

export const CardTitle = ({ children }) => {
  return (
    <h2 className="text-xl font-bold">
      {children}
    </h2>
  );
};

export const CardContent = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default Card;