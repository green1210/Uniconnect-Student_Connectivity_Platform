import React from 'react';
import Card from '../ui/Card.jsx';
export default function MaterialCard({ title, url, by }){
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <Card>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-subtle">Uploaded by {by}</div>
      </Card>
    </a>
  );
}
