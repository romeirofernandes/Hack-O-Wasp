import React from 'react';
import { Link } from 'react-router-dom';

export default function DeckCard({ deck }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
      <Link to={`/deck/${deck._id}`}>
        <h3 className="text-xl font-semibold mb-2">{deck.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{deck.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>By {deck.author?.name || 'Anonymous'}</span>
          <div className="flex items-center space-x-2">
            <span>{deck.content.flashcards.length} Cards</span>
            <span>•</span>
            <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}