import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

// Create a cache store using localForage
const fileCache = localForage.createInstance({
  name: 'mvpbuilder-bundler-cache',
});

// Define the unpkg plugin for esbuild
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // Handle root entry file
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // Handle relative paths in a module
      build.onResolve({ filter: /^\.+\// }, (args: esbuild.OnResolveArgs) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
        };
      });

      // Handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: esbuild.OnResolveArgs) => {
        // Don't attempt to resolve these packages with unpkg
        if (['fs', 'path', 'child_process', 'crypto', 'net', 'tls'].includes(args.path)) {
          return {
            path: args.path,
            namespace: 'empty-module',
          };
        }

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
          };
        }

        // If it's a node built-in module, mark it as external
        if (args.path.match(/^node:/)) {
          return {
            path: args.path,
            namespace: 'empty-module',
          };
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });

      // Handle empty modules (node built-ins, etc.)
      build.onLoad({ filter: /.*/, namespace: 'empty-module' }, () => {
        return {
          contents: 'export default {}',
          loader: 'js',
        };
      });

      // Load files from unpkg
      build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
        // Check if we've already fetched this file
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        if (cachedResult) {
          return cachedResult;
        }

        try {
          // If not in cache, fetch it with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          const { data, request } = await axios.get(args.path, {
            signal: controller.signal,
            timeout: 15000,
          });
          
          clearTimeout(timeoutId);

          // Determine the correct loader based on file extension
          const loader = getLoader(args.path);

          // Store response in cache
          const result: esbuild.OnLoadResult = {
            loader,
            contents: data,
            resolveDir: new URL('./', request.responseURL).pathname,
          };
          await fileCache.setItem(args.path, result);

          return result;
        } catch (error) {
          console.error(`Error fetching ${args.path}:`, error);
          
          // For unpkg.com, try adding ?module to get the ESM version
          if (args.path.includes('unpkg.com') && !args.path.includes('?module')) {
            try {
              const { data, request } = await axios.get(`${args.path}?module`);
              
              const loader = getLoader(args.path);
              const result: esbuild.OnLoadResult = {
                loader,
                contents: data,
                resolveDir: new URL('./', request.responseURL).pathname,
              };
              await fileCache.setItem(args.path, result);
              
              return result;
            } catch (secondError) {
              console.error(`Error fetching ${args.path}?module:`, secondError);
              
              // If we still fail, return an empty module
              return {
                loader: 'js',
                contents: `console.warn("Failed to load module: ${args.path}"); export default {};`,
              };
            }
          } else {
            // If not an unpkg URL or retrying didn't work, return an empty module
            return {
              loader: 'js',
              contents: `console.warn("Failed to load module: ${args.path}"); export default {};`,
            };
          }
        }
      });
    },
  };
};

// Helper to determine the correct loader based on file extension
function getLoader(path: string): esbuild.Loader {
  if (path.match(/\.jsx$/)) return 'jsx';
  if (path.match(/\.tsx$/)) return 'tsx';
  if (path.match(/\.ts$/)) return 'ts';
  if (path.match(/\.css$/)) return 'css';
  if (path.match(/\.json$/)) return 'json';
  if (path.match(/\.(png|jpe?g|gif|svg|webp)$/)) return 'file';
  return 'jsx'; // Default to jsx for better compatibility
} 