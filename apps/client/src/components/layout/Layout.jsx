import React from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import AiBuddyButton from './AiBuddyButton.jsx';
import MessengerButton from './MessengerButton.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" role="application">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main-content" className="flex-1 p-6 animate-fade" role="main" aria-label="Main content area">{children}</main>
      </div>
      <MessengerButton />
      <AiBuddyButton />
    </div>
  );
}
