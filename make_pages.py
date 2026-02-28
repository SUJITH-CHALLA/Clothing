import os
dirs = ['track', 'returns', 'contact', 'privacy', 'terms', 'refunds', 'new-drops', 'collections', 'sale']
for d in dirs:
    os.makedirs(f'src/app/(shop)/{d}', exist_ok=True)
    with open(f'src/app/(shop)/{d}/page.tsx', 'w') as f:
        f.write(f'export default function Page() {{ return <div className=\"min-h-screen flex items-center justify-center\"><h1 className=\"text-4xl font-bold uppercase\">{d.replace("-\", " \")}</h1></div>; }}')
