<script lang="ts">
  export let data: { posts: any[] };
</script>
<svelte:head><title>Lunx Blog</title></svelte:head>
<main style="max-width:800px;margin:0 auto;padding:32px;font-family:system-ui;background:#0f172a;min-height:100vh;color:#f1f5f9">
  <h1 style="font-size:36px;margin-bottom:8px">⚡ Lunx Blog</h1>
  <p style="color:#94a3b8;margin-bottom:32px">Engineering insights from the Lunx team</p>
  {#each data.posts as post}
    <article style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px">{post.category} · {post.date}</div>
      <h2 style="margin:12px 0 8px"><a href="/blog/{post.slug}" style="color:#f1f5f9;text-decoration:none">{post.title}</a></h2>
      <p style="color:#94a3b8;line-height:1.6">{post.excerpt}</p>
      <div style="margin-top:16px;display:flex;gap:8px">
        {#each post.tags as tag}
          <span style="background:#0f172a;padding:4px 12px;border-radius:999px;font-size:12px;color:#818cf8">{tag}</span>
        {/each}
      </div>
    </article>
  {/each}
</main>
