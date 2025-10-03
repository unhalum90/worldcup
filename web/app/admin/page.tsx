"use client";

import { useState } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    preview: "",
    substackUrl: "",
    publishDate: new Date().toISOString().split("T")[0],
  });

  // Simple password check (we'll improve this later)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "worldcup2026") {
      setIsAuthenticated(true);
      loadPosts();
    } else {
      alert("Incorrect password");
    }
  };

  const loadPosts = () => {
    const saved = localStorage.getItem("blogPosts");
    if (saved) {
      setPosts(JSON.parse(saved));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      ...formData,
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("blogPosts", JSON.stringify(updatedPosts));
    
    // Reset form
    setFormData({
      title: "",
      preview: "",
      substackUrl: "",
      publishDate: new Date().toISOString().split("T")[0],
    });
    
    alert("Post added successfully!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter((p) => p.id !== id);
      setPosts(updatedPosts);
      localStorage.setItem("blogPosts", JSON.stringify(updatedPosts));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Default password: worldcup2026
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Blog Admin Dashboard</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>

          {/* Add New Post Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8 pb-8 border-b">
            <h2 className="text-xl font-semibold mb-4">Add New Substack Post</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the headline from your Substack post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preview Text *
              </label>
              <textarea
                required
                value={formData.preview}
                onChange={(e) =>
                  setFormData({ ...formData, preview: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter a brief preview/excerpt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Substack URL *
              </label>
              <input
                type="url"
                required
                value={formData.substackUrl}
                onChange={(e) =>
                  setFormData({ ...formData, substackUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yoursubstack.substack.com/p/post-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Publish Date *
              </label>
              <input
                type="date"
                required
                value={formData.publishDate}
                onChange={(e) =>
                  setFormData({ ...formData, publishDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Add Post
            </button>
          </form>

          {/* Posts List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Published Posts ({posts.length})
            </h2>
            
            {posts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No posts yet. Add your first Substack post above!
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {post.preview}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>📅 {post.publishDate}</span>
                          <a
                            href={post.substackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on Substack →
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
