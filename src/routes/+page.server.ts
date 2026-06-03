import type { Project, Profile } from '../app.d.ts';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

interface PageResponse {
	projects: Project[];
	profile: Profile;
}

export const load = async ({ fetch }): Promise<PageResponse> => {
  try {
    // Fetch projects and profile data in parallel
    const [projectsResponse, profileResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/projects`),
      fetch(`${API_BASE_URL}/api/profile`)
    ]);
    
    // Handle projects data
    let projects: Project[] = [];
    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      projects = (projectsData as Project[]).filter(project => project.status === 'current');
    } else {
      console.error('Failed to fetch projects:', projectsResponse.status, projectsResponse.statusText);
      // Fallback projects data
      projects = [
          {
            id: 1,
            name: 'DAY100',
            description: 'Rep counter with a private leaderboard.',
            icon: 'https://day100.app/favicon.ico',
            href: 'https://apps.apple.com/us/app/day100-exercise-with-friends/id6744286523',
            tags: ['swift', 'ios', 'core data'],
            status: 'current'
          },
          {
            id: 2,
            name: 'Walk Flower',
            description: 'Pedometer with flowers.',
            icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4b/2a/1d/4b2a1d53-cafe-aced-7157-c0f8932c73e7/AppIcon-0-0-1x_U007ephone-0-0-0-1-0-85-220.png/230x0w.webp',
            href: 'https://apps.apple.com/us/app/walk-flower/id6532313329',
            tags: ['swift', 'ios', 'core data'],
            status: 'current'
          },
          {
            id: 3,
            name: 'Stop Working',
            description: 'A break reminder for macOS.',
            icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/90/ef/19/90ef1971-e7a0-8b46-4065-a2dcb3284298/AppIcon-85-220-4-2x.png/460x0w.webp',
            href: 'https://apps.apple.com/us/app/stop-working-break-reminder/id6446755293',
            tags: ['swift', 'macos'],
            status: 'current'
          },
          {
            id: 4,
            name: 'Runway',
            description: 'Manual Expense Tracker.',
            icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5b/d6/ca/5bd6cad8-5938-b125-3889-13283aa153bc/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/230x0w.webp',
            href: 'https://apps.apple.com/us/app/ease-expense-tracker/id6445955890',
            tags: ['swift', 'ios', 'core data'],
            status: 'current'
          },
          {
            id: 5,
            name: 'Timezones',
            description: 'Timezone viewer for web.',
            icon: 'https://time.tem.dev/favicon.png',
            href: 'https://time.tem.dev',
            tags: ['svelte'],
            status: 'current'
          }
        ];
    }
    
    // Handle profile data
    let profile: Profile = {
      name: 'Tem',
      intro: 'I make apps and based in Chicago, IL.',
      twitter_url: 'https://x.com/@tuna_maker',
      twitter_label: 'Twitter/X'
    };
    
    if (profileResponse.ok) {
      profile = await profileResponse.json();
    } else {
      console.error('Failed to fetch profile:', profileResponse.status, profileResponse.statusText);
    }
    
    return {
      projects,
      profile
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    // Return fallback data if there's an error
    return {
      projects: [],
      profile: {
        name: 'Tem',
        intro: 'I make apps and based in Chicago, IL.',
        twitter_url: 'https://x.com/@tuna_maker',
        twitter_label: 'Twitter/X'
      }
    };
  }
};