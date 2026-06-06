import type { Project, Profile } from '../app';
import { API_BASE_URL } from '$env/static/private';

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
      projects = projectsData as Project[];
    } else {
      console.error('Failed to fetch projects:', projectsResponse.status, projectsResponse.statusText);
      // Fallback projects data
      projects = [
        ];
    }
    
    // Handle profile data
    let profile: Profile = {
      name: 'Tem',
      intro: '',
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
        intro: '',
        twitter_url: 'https://x.com/@tuna_maker',
        twitter_label: 'Twitter/X'
      }
    };
  }
};