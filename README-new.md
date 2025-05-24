# Student Career Interest Survey

A React-TypeScript web application for collecting student career preferences through an interactive drag-and-drop interface.

## Features

- **Student Information Form**: Collects name, gender, and school selection (limited to SMPN 1-5 Melaya)
- **Interactive Job Sorting**: Drag-and-drop interface for ranking job preferences
- **Multiple Job Sets**: Three different sets of 12 jobs each covering:
  - Technology & Science professions
  - Creative & Media professions  
  - Business & Service professions
- **Data Storage**: Saves preferences locally (ready for database integration)
- **Responsive Design**: Works on desktop and mobile devices
- **Indonesian Language**: Fully localized in Bahasa Indonesia

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **@dnd-kit** for drag-and-drop functionality
- **Modern CSS** with gradients and animations
- **ESLint** for code quality

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd minat-sorter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── StudentForm.tsx     # Student information form
│   ├── JobSorter.tsx       # Drag-and-drop job sorting interface
│   ├── JobCard.tsx         # Individual job card component
│   ├── SortableJobCard.tsx # Sortable job card for ranking
│   ├── CompletionPage.tsx  # Final completion page
│   └── *.css              # Component styles
├── types.ts            # TypeScript type definitions
├── data.ts             # Sample job data and storage functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Usage

1. **Fill Student Form**: Enter name, select gender, and choose school
2. **Sort Jobs**: Use drag-and-drop to rank jobs from most to least preferred
3. **Complete All Sets**: Go through all three job sets
4. **Download Results**: Get a JSON file with all preferences

## Data Storage

Currently saves data to localStorage. The `savePreferencesToDatabase` function in `data.ts` is ready for integration with a real database.

## Customization

### Adding New Job Sets

Edit the `sampleJobSets` array in `src/data.ts`:

```typescript
export const sampleJobSets: JobSet[] = [
  {
    id: 4,
    name: "New Job Category",
    jobs: [
      { id: "job-1", title: "Job Title", description: "Job description" },
      // ... more jobs
    ]
  }
];
```

### Modifying Schools

Update the `SCHOOLS` array in `src/types.ts`:

```typescript
export const SCHOOLS = [
  'New School 1',
  'New School 2',
  // ... more schools
] as const;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check code quality
5. Submit a pull request

## License

This project is licensed under the MIT License.
