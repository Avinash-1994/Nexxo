import { useState } from 'react';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  return (
    <div class="search-box" data-island="SearchBox">
      <input type="search" value={query} onInput={e => setQuery(e.target.value)} placeholder="Search..." />
      {query && <p>Searching for: {query}</p>}
    </div>
  );
}
