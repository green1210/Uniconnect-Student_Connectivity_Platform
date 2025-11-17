import React from 'react';
import Card from '../ui/Card.jsx';
export default function ProjectCard({ name='Open Study Group', summary='Collaborative notes and resources', members=12 }){
  return (
    <Card>
      <div className="font-semibold mb-1">{name}</div>
      <div className="text-sm text-subtle mb-3">{summary}</div>
      <div className="text-xs text-subtle">{members} members</div>
    </Card>
  );
}
