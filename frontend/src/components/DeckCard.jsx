import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

export default function DeckCard({ deck }) {
  const [authorName, setAuthorName] = useState('Anonymous');

  useEffect(() => {
    const fetchAuthorName = async () => {
      try {
        const response = await api.get(`/api/users/${deck.author}/name`);
        if (response.data.success) {
          // Get first name only
          const firstName = response.data.name.split(' ')[0];
          setAuthorName(firstName);
        }
      } catch (error) {
        console.error('Error fetching author name:', error);
      }
    };

    if (deck.author) {
      fetchAuthorName();
    }
  }, [deck.author]);

  return (
    <div className="h-48 border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white/5 flex flex-col justify-between">
      <div className="flex-1 min-h-0">
        <Link to={`/deck/${deck._id}`} className="block h-full">
          <h3 className="text-xl font-semibold mb-2 text-white line-clamp-1">{deck.title}</h3>
          <p className="text-gray-400 line-clamp-2">{deck.description}</p>
        </Link>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-400 pt-2 border-t border-white/10">
        <span>By {authorName}</span>
        <div className="flex items-center space-x-2">
          <span>{deck.content.flashcards.length} Cards</span>
          <span>•</span>
          <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}