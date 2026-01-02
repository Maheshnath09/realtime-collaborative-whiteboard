import React from 'react';
import { Navigate } from 'react-router-dom';

// Settings page has been removed. Redirect users to profile.
const SettingsPage: React.FC = () => {
    return <Navigate to="/profile" replace />;
};

export default SettingsPage;
