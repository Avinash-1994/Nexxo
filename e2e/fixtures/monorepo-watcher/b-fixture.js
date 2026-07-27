
        const { DevWatcher } = await import('../../../dist/src/dev/watcher.js?tB=' + Date.now());
        const watcher = new DevWatcher(process.argv[2], 50);
        
        setTimeout(() => {
            console.log(watcher.getWatcherAdapter());
            process.exit(0);
        }, 100);
    