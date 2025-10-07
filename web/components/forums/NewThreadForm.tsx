"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  cityId: string;
  citySlug: string;
  onThreadCreated?: () => void;
};

export default function NewThreadForm({ cityId, citySlug, onThreadCreated }: Props) {
  // reuse singleton client
  const _supabase = supabase;
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('tickets');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
  const { data: user } = await _supabase.auth.getUser();
      if (!user.user) {
        setMessage('You must be signed in to create a thread.');
        setLoading(false);
        return;
      }

      // Insert and return id so we can navigate to the new thread directly
      const { data: inserted, error } = await _supabase
        .from('threads')
        .insert({
          city_id: cityId,
          author_id: user.user.id,
          title: title.trim(),
          body_md: body.trim(),
          topic: topic
        })
        .select('id')
        .limit(1)
        .single();

      if (error) {
        setMessage('Error creating thread: ' + error.message);
      } else if (!inserted?.id) {
        setMessage('Thread created, but could not determine its id.');
        onThreadCreated?.();
      } else {
        setMessage('Thread created successfully!');
        setTitle('');
        setBody('');
        onThreadCreated?.();
        // Navigate to the new thread
        setTimeout(() => router.push(`/forums/${citySlug}/threads/${inserted.id}`), 150);
      }
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="mb-6 p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold mb-4">Start a New Thread</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="tickets">Tickets</option>
            <option value="meetups">Meetups</option>
            <option value="transport">Transport & Transit</option>
            <option value="food-bars">Food & Bars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your thread about?"
            className="w-full px-3 py-2 border rounded"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share details, ask questions, or start a discussion..."
            className="w-full px-3 py-2 border rounded h-24"
            maxLength={2000}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !body.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Thread'}
        </button>
      </form>

      {message && (
        <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}