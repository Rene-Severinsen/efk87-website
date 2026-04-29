import React from 'react';
import { 
  MessageCircle, 
  Compass, 
  Battery, 
  Plane, 
  GraduationCap, 
  Tag, 
  Wrench, 
  Settings, 
  Calendar, 
  Wind,
  LucideProps
} from 'lucide-react';

const CloudWind = Wind;
import { ForumIconKey } from '../../lib/forum/forumHelpers';

interface ForumIconProps extends LucideProps {
  iconKey: string;
}

export default function ForumIcon({ iconKey, ...props }: ForumIconProps) {
  switch (iconKey as ForumIconKey) {
    case 'message-circle':
      return <MessageCircle {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'battery':
      return <Battery {...props} />;
    case 'glider':
      return <Plane {...props} />; // Fallback to Plane as requested if Glider unavailable
    case 'graduation-cap':
      return <GraduationCap {...props} />;
    case 'tag':
      return <Tag {...props} />;
    case 'wrench':
      return <Wrench {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'calendar':
      return <Calendar {...props} />;
    case 'cloud-wind':
      return <CloudWind {...props} />;
    default:
      return <MessageCircle {...props} />;
  }
}
