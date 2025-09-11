/**
 * Team members mock data with 50+ members across realms with different roles
 * Task C1: Advanced Mock Data Expansion
 */

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role: TeamRole;
  status: UserStatus;
  department: string;
  jobTitle: string;
  location: string;
  timezone: string;
  phone?: string;
  bio?: string;
  skills: string[];
  certifications: string[];
  languages: Language[];
  joinedAt: Date;
  lastLoginAt: Date;
  lastActiveAt: Date;
  isOnline: boolean;
  preferences: UserPreferences;
  socialProfiles: SocialProfile[];
  realmMemberships: RealmMembership[];
  permissions: TeamPermission[];
  activityMetrics: ActivityMetrics;
  projectAssignments: ProjectAssignment[];
  communicationPreferences: CommunicationPreferences;
  workSchedule: WorkSchedule;
  emergencyContact?: EmergencyContact;
  notes?: string;
}

export type TeamRole = 
  | 'system-admin' 
  | 'realm-admin' 
  | 'team-lead' 
  | 'senior-member' 
  | 'member' 
  | 'viewer' 
  | 'guest'
  | 'contractor'
  | 'intern';

export type UserStatus = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'suspended' 
  | 'invited'
  | 'on-leave'
  | 'terminated';

export interface Language {
  code: string;
  name: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  };
  privacy: {
    showOnlineStatus: boolean;
    showProfile: 'everyone' | 'team' | 'admins' | 'nobody';
    allowDirectMessages: boolean;
  };
}

export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'github' | 'website' | 'blog' | 'other';
  url: string;
  username?: string;
  verified: boolean;
}

export interface RealmMembership {
  realmId: string;
  realmName: string;
  role: 'admin' | 'editor' | 'viewer' | 'guest';
  joinedAt: Date;
  invitedBy: string;
  status: 'active' | 'pending' | 'suspended';
  permissions: string[];
  quotas: {
    storage: number; // bytes
    documents: number;
    apiCalls: number;
  };
}

export interface TeamPermission {
  scope: 'system' | 'realm' | 'project' | 'document';
  scopeId: string;
  permission: string;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface ActivityMetrics {
  documentsUploaded: number;
  documentsProcessed: number;
  searchesPerformed: number;
  loginCount: number;
  hoursActive: number;
  collaborationsCount: number;
  lastWeekActivity: {
    logins: number;
    uploads: number;
    searches: number;
    collaborations: number;
  };
  topActivities: Array<{
    type: string;
    count: number;
    lastPerformed: Date;
  }>;
}

export interface ProjectAssignment {
  projectId: string;
  projectName: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  responsibilities: string[];
}

export interface CommunicationPreferences {
  channels: {
    email: boolean;
    slack: boolean;
    teams: boolean;
    phone: boolean;
    inApp: boolean;
  };
  availability: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
  responseTime: 'immediate' | 'within-hour' | 'within-day' | 'when-available';
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  type: 'work' | 'flexible' | 'unavailable';
}

export interface WorkSchedule {
  type: 'full-time' | 'part-time' | 'contract' | 'intern';
  hoursPerWeek: number;
  startDate: Date;
  endDate?: Date;
  workDays: string[]; // ['monday', 'tuesday', ...]
  workHours: {
    start: string;
    end: string;
    timezone: string;
  };
  flexibility: 'strict' | 'flexible' | 'hybrid';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Generate comprehensive team members dataset
function generateTeamMembers(): TeamMember[] {
  const members: TeamMember[] = [];
  
  // Base data arrays
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
    'William', 'Jennifer', 'James', 'Maria', 'Christopher', 'Jessica', 'Daniel',
    'Ashley', 'Matthew', 'Amanda', 'Anthony', 'Melissa', 'Mark', 'Deborah',
    'Donald', 'Rachel', 'Steven', 'Carolyn', 'Andrew', 'Janet', 'Joshua',
    'Catherine', 'Kenneth', 'Frances', 'Kevin', 'Christine', 'Brian', 'Samantha',
    'George', 'Debra', 'Timothy', 'Ruth', 'Ronald', 'Sharon', 'Jason', 'Michelle',
    'Edward', 'Laura', 'Jeffrey', 'Sarah', 'Ryan', 'Kimberly', 'Jacob', 'Susan',
    'Gary', 'Betty', 'Nicholas', 'Helen', 'Eric', 'Sandra', 'Jonathan', 'Donna'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
    'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
    'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz'
  ];
  
  const departments = [
    'Engineering', 'Product Management', 'Design', 'Marketing', 'Sales',
    'Customer Success', 'Human Resources', 'Finance', 'Legal', 'Operations',
    'Data Science', 'DevOps', 'Quality Assurance', 'Security', 'Analytics',
    'Business Development', 'Strategy', 'Communications', 'IT', 'Research'
  ];
  
  const jobTitles = {
    'Engineering': [
      'Senior Software Engineer', 'Software Engineer', 'Principal Engineer',
      'Engineering Manager', 'Tech Lead', 'Full Stack Developer',
      'Backend Engineer', 'Frontend Engineer', 'DevOps Engineer',
      'Data Engineer', 'ML Engineer', 'QA Engineer', 'Security Engineer'
    ],
    'Product Management': [
      'Senior Product Manager', 'Product Manager', 'Associate Product Manager',
      'Principal Product Manager', 'VP of Product', 'Product Owner',
      'Technical Product Manager', 'Product Marketing Manager'
    ],
    'Design': [
      'Senior UX Designer', 'UX Designer', 'UI Designer', 'Product Designer',
      'Design Director', 'UX Researcher', 'Visual Designer', 'Design Systems Lead'
    ],
    'Marketing': [
      'Marketing Manager', 'Digital Marketing Specialist', 'Content Marketing Manager',
      'Brand Manager', 'Growth Marketing Manager', 'Marketing Director',
      'SEO Specialist', 'Social Media Manager', 'Campaign Manager'
    ],
    'Sales': [
      'Account Executive', 'Senior Account Executive', 'Sales Manager',
      'Business Development Representative', 'Sales Director', 'Regional Sales Manager',
      'Inside Sales Representative', 'Sales Operations Manager'
    ],
    'Human Resources': [
      'HR Manager', 'HR Business Partner', 'Recruiter', 'Senior Recruiter',
      'HR Director', 'People Operations Manager', 'Talent Acquisition Manager',
      'HR Generalist', 'Compensation Analyst'
    ]
  };
  
  const locations = [
    'New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL',
    'Boston, MA', 'Austin, TX', 'Seattle, WA', 'Denver, CO', 'Atlanta, GA',
    'Miami, FL', 'Dallas, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'Detroit, MI',
    'London, UK', 'Berlin, Germany', 'Paris, France', 'Tokyo, Japan',
    'Toronto, Canada', 'Sydney, Australia', 'Singapore', 'Amsterdam, Netherlands',
    'Barcelona, Spain', 'Dublin, Ireland', 'Stockholm, Sweden', 'Remote'
  ];
  
  const timezones = [
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo',
    'America/Toronto', 'Australia/Sydney', 'Asia/Singapore', 'Europe/Amsterdam'
  ];
  
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go',
    'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'PostgreSQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST APIs', 'Microservices', 'DevOps', 'CI/CD',
    'Machine Learning', 'Data Analysis', 'Product Strategy', 'UX Design',
    'UI Design', 'Project Management', 'Agile', 'Scrum', 'Leadership',
    'Team Management', 'Strategic Planning', 'Digital Marketing', 'SEO',
    'Content Strategy', 'Sales Strategy', 'Customer Success', 'Analytics'
  ];
  
  const certifications = [
    'AWS Certified Solutions Architect', 'Google Cloud Professional',
    'Microsoft Azure Fundamentals', 'Certified Kubernetes Administrator',
    'PMP Project Management', 'Certified Scrum Master', 'Agile Certified Practitioner',
    'Google Analytics Certified', 'HubSpot Certified', 'Salesforce Certified',
    'Certified Information Security Manager', 'Six Sigma Green Belt',
    'Product Management Certificate', 'UX Design Certificate'
  ];
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' }
  ];
  
  const realms = [
    { id: 'realm-1', name: 'Engineering Platform' },
    { id: 'realm-2', name: 'Product Documentation' },
    { id: 'realm-3', name: 'Marketing Hub' },
    { id: 'realm-4', name: 'Sales Enablement' },
    { id: 'realm-5', name: 'HR Knowledge Base' },
    { id: 'realm-6', name: 'Finance Operations' },
    { id: 'realm-7', name: 'Customer Support' },
    { id: 'realm-8', name: 'Legal & Compliance' }
  ];
  
  const roles: TeamRole[] = [
    'system-admin', 'realm-admin', 'team-lead', 'senior-member', 'member', 'viewer', 'guest', 'contractor', 'intern'
  ];
  
  const statuses: UserStatus[] = ['active', 'inactive', 'pending', 'on-leave', 'invited'];
  
  // Helper functions
  const randomChoice = <T>(arr: T[]): T => {
    if (arr.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    return arr[Math.floor(Math.random() * arr.length)]!;
  };
  const randomChoices = <T>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
  };
  const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomDate = (start: Date, end: Date): Date => 
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  const generateAvatar = (name: string): string => {
    const initials = name.split(' ').map(n => n[0]).join('');
    const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo', 'teal'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=128`;
  };
  
  // Generate 60 team members
  for (let i = 1; i <= 60; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@morag.com`;
    const department = randomChoice(departments);
    const role = randomChoice(roles);
    const status = randomChoice(statuses);
    const location = randomChoice(locations);
    const joinedAt = randomDate(new Date('2022-01-01'), new Date());
    const lastLoginAt = randomDate(new Date('2024-08-01'), new Date());
    const lastActiveAt = randomDate(lastLoginAt, new Date());
    const isOnline = Math.random() > 0.7;
    
    // Generate realm memberships
    const membershipCount = randomInt(1, 4);
    const memberRealms = randomChoices(realms, membershipCount);
    const realmMemberships: RealmMembership[] = memberRealms.map(realm => ({
      realmId: realm.id,
      realmName: realm.name,
      role: randomChoice(['admin', 'editor', 'viewer', 'guest'] as const),
      joinedAt: randomDate(joinedAt, new Date()),
      invitedBy: 'system',
      status: 'active',
      permissions: randomChoices(['read', 'write', 'admin', 'share', 'delete'], randomInt(2, 4)),
      quotas: {
        storage: randomInt(1, 100) * 1024 * 1024 * 1024, // GB
        documents: randomInt(100, 10000),
        apiCalls: randomInt(1000, 100000)
      }
    }));
    
    // Generate user skills and certifications
    const userSkills = randomChoices(skills, randomInt(5, 12));
    const userCertifications = randomChoices(certifications, randomInt(0, 4));
    
    // Generate user languages
    const userLanguages: Language[] = [
      { code: 'en', name: 'English', proficiency: 'native' },
      ...randomChoices(languages.filter(l => l.code !== 'en'), randomInt(0, 3)).map(lang => ({
        ...lang,
        proficiency: randomChoice(['fluent', 'conversational', 'basic'] as const)
      }))
    ];
    
    // Generate activity metrics
    const activityMetrics: ActivityMetrics = {
      documentsUploaded: randomInt(10, 500),
      documentsProcessed: randomInt(5, 300),
      searchesPerformed: randomInt(50, 2000),
      loginCount: randomInt(100, 1000),
      hoursActive: randomInt(200, 2000),
      collaborationsCount: randomInt(20, 200),
      lastWeekActivity: {
        logins: randomInt(3, 15),
        uploads: randomInt(0, 20),
        searches: randomInt(5, 100),
        collaborations: randomInt(2, 30)
      },
      topActivities: [
        { type: 'document_upload', count: randomInt(20, 100), lastPerformed: randomDate(new Date('2024-08-01'), new Date()) },
        { type: 'search_query', count: randomInt(50, 300), lastPerformed: randomDate(new Date('2024-08-01'), new Date()) },
        { type: 'collaboration', count: randomInt(10, 80), lastPerformed: randomDate(new Date('2024-08-01'), new Date()) }
      ]
    };
    
    // Generate project assignments
    const projectCount = randomInt(1, 3);
    const projectAssignments: ProjectAssignment[] = [];
    for (let p = 0; p < projectCount; p++) {
      const startDate = randomDate(joinedAt, new Date());
      projectAssignments.push({
        projectId: `project-${randomInt(1, 50)}`,
        projectName: `Project ${randomChoice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'])} ${randomInt(1, 100)}`,
        role: randomChoice(['Lead', 'Developer', 'Designer', 'Analyst', 'Contributor']),
        startDate,
        ...(Math.random() > 0.6 && { endDate: randomDate(startDate, new Date('2024-12-31')) }),
        status: randomChoice(['active', 'completed', 'paused'] as const),
        progress: randomInt(20, 100),
        responsibilities: randomChoices([
          'Development', 'Testing', 'Documentation', 'Code Review', 'Architecture',
          'Requirements Analysis', 'UI/UX Design', 'Performance Optimization'
        ], randomInt(2, 4))
      });
    }
    
    // Generate work schedule
    const workSchedule: WorkSchedule = {
      type: randomChoice(['full-time', 'part-time', 'contract', 'intern'] as const),
      hoursPerWeek: randomChoice([40, 32, 24, 20]),
      startDate: joinedAt,
      ...((role === 'intern' || role === 'contractor') && { endDate: randomDate(joinedAt, new Date('2024-12-31')) }),
      workDays: randomChoices(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 5),
      workHours: {
        start: randomChoice(['08:00', '09:00', '10:00']),
        end: randomChoice(['17:00', '18:00', '19:00']),
        timezone: randomChoice(timezones)
      },
      flexibility: randomChoice(['strict', 'flexible', 'hybrid'] as const)
    };
    
    // Create base member object with required properties
    const baseMember: Omit<TeamMember, 'phone' | 'bio' | 'emergencyContact' | 'notes'> = {
      id: `user-${i.toString().padStart(3, '0')}`,
      email,
      name,
      firstName,
      lastName,
      displayName: Math.random() > 0.8 ? `${firstName} ${lastName[0]}.` : name,
      avatar: generateAvatar(name),
      role,
      status,
      department,
      jobTitle: randomChoice(jobTitles[department as keyof typeof jobTitles] || ['Team Member', 'Specialist', 'Associate']),
      location,
      timezone: randomChoice(timezones),
      skills: userSkills,
      certifications: userCertifications,
      languages: userLanguages,
      joinedAt,
      lastLoginAt,
      lastActiveAt,
      isOnline,
      preferences: {
        theme: randomChoice(['light', 'dark', 'auto'] as const),
        language: 'en',
        dateFormat: randomChoice(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
        timeFormat: randomChoice(['12h', '24h'] as const),
        numberFormat: randomChoice(['US', 'EU', 'UK']),
        notifications: {
          email: Math.random() > 0.3,
          push: Math.random() > 0.4,
          desktop: Math.random() > 0.5,
          digest: randomChoice(['immediate', 'hourly', 'daily', 'weekly'] as const)
        },
        privacy: {
          showOnlineStatus: Math.random() > 0.2,
          showProfile: randomChoice(['everyone', 'team', 'admins'] as const),
          allowDirectMessages: Math.random() > 0.1
        }
      },
      socialProfiles: [
        ...(Math.random() > 0.6 ? [{
          platform: 'linkedin' as const,
          url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          username: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          verified: Math.random() > 0.7
        }] : []),
        ...(Math.random() > 0.8 ? [{
          platform: 'github' as const,
          url: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          verified: Math.random() > 0.5
        }] : [])
      ],
      realmMemberships,
      permissions: realmMemberships.map(membership => ({
        scope: 'realm' as const,
        scopeId: membership.realmId,
        permission: membership.role,
        grantedAt: membership.joinedAt,
        grantedBy: membership.invitedBy,
        ...(Math.random() > 0.8 && { expiresAt: randomDate(new Date(), new Date('2025-12-31')) })
      })),
      activityMetrics,
      projectAssignments,
      communicationPreferences: {
        channels: {
          email: Math.random() > 0.2,
          slack: Math.random() > 0.3,
          teams: Math.random() > 0.6,
          phone: Math.random() > 0.7,
          inApp: Math.random() > 0.1
        },
        availability: {
          monday: [{ start: '09:00', end: '17:00', type: 'work' }],
          tuesday: [{ start: '09:00', end: '17:00', type: 'work' }],
          wednesday: [{ start: '09:00', end: '17:00', type: 'work' }],
          thursday: [{ start: '09:00', end: '17:00', type: 'work' }],
          friday: [{ start: '09:00', end: '17:00', type: 'work' }],
          saturday: [],
          sunday: []
        },
        responseTime: randomChoice(['immediate', 'within-hour', 'within-day'] as const)
      },
      workSchedule
    };

    // Add optional properties only if they have values (not undefined)
    const member: TeamMember = {
      ...baseMember,
      ...(Math.random() > 0.7 && { phone: `+1${randomInt(100, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}` }),
      ...(Math.random() > 0.5 && { bio: `Experienced ${department.toLowerCase()} professional with ${randomInt(2, 15)} years in the industry.` }),
      ...(Math.random() > 0.5 && {
        emergencyContact: {
          name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
          relationship: randomChoice(['Spouse', 'Parent', 'Sibling', 'Friend']),
          phone: `+1${randomInt(100, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
          ...(Math.random() > 0.5 && { email: `emergency${randomInt(1, 999)}@example.com` })
        }
      }),
      ...(Math.random() > 0.8 && { notes: `Additional notes about ${firstName}` })
    };
    
    members.push(member);
  }
  
  return members;
}

// Generate the team members dataset
export const teamMembers: TeamMember[] = generateTeamMembers();

// Helper functions for accessing team member data
export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

export const getTeamMembersByRealm = (realmId: string): TeamMember[] => {
  return teamMembers.filter(member => 
    member.realmMemberships.some(membership => membership.realmId === realmId)
  );
};

export const getTeamMembersByRole = (role: TeamRole): TeamMember[] => {
  return teamMembers.filter(member => member.role === role);
};

export const getTeamMembersByDepartment = (department: string): TeamMember[] => {
  return teamMembers.filter(member => member.department === department);
};

export const getActiveTeamMembers = (): TeamMember[] => {
  return teamMembers.filter(member => member.status === 'active');
};

export const getOnlineTeamMembers = (): TeamMember[] => {
  return teamMembers.filter(member => member.isOnline);
};

export const searchTeamMembers = (query: string): TeamMember[] => {
  const lowerQuery = query.toLowerCase();
  return teamMembers.filter(member =>
    member.name.toLowerCase().includes(lowerQuery) ||
    member.email.toLowerCase().includes(lowerQuery) ||
    member.department.toLowerCase().includes(lowerQuery) ||
    member.jobTitle.toLowerCase().includes(lowerQuery) ||
    member.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
  );
};

export const getTeamMemberStats = () => {
  const total = teamMembers.length;
  const active = teamMembers.filter(m => m.status === 'active').length;
  const online = teamMembers.filter(m => m.isOnline).length;
  
  const roleDistribution = teamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const departmentDistribution = teamMembers.reduce((acc, member) => {
    acc[member.department] = (acc[member.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    active,
    online,
    roleDistribution,
    departmentDistribution,
    avgRealmMemberships: teamMembers.reduce((sum, m) => sum + m.realmMemberships.length, 0) / total,
    lastUpdated: new Date().toISOString()
  };
};

// Export for use in other components
export default teamMembers;