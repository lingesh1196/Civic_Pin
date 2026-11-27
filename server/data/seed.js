const bcrypt = require('bcryptjs');

function getSeedData() {
  const adminHash = bcrypt.hashSync('admin123', 10);
  const citizenHash = bcrypt.hashSync('citizen123', 10);

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();

  const users = [
    {
      _id: 'user-admin-1',
      name: 'Priya Ramanathan',
      email: 'admin@civicpin.org',
      passwordHash: adminHash,
      role: 'admin',
      neighborhood: 'Municipal Corporation HQ',
      createdAt: hoursAgo(240),
      updatedAt: hoursAgo(240),
    },
    {
      _id: 'user-citizen-1',
      name: 'Arjun Karthik',
      email: 'citizen@civicpin.org',
      passwordHash: citizenHash,
      role: 'citizen',
      neighborhood: 'Adyar',
      createdAt: hoursAgo(200),
      updatedAt: hoursAgo(200),
    },
    {
      _id: 'user-citizen-2',
      name: 'Meera Sundaram',
      email: 'meera@example.com',
      passwordHash: citizenHash,
      role: 'citizen',
      neighborhood: 'T. Nagar',
      createdAt: hoursAgo(180),
      updatedAt: hoursAgo(180),
    },
    {
      _id: 'user-citizen-3',
      name: 'Vikram Nair',
      email: 'vikram@example.com',
      passwordHash: citizenHash,
      role: 'citizen',
      neighborhood: 'Anna Nagar',
      createdAt: hoursAgo(150),
      updatedAt: hoursAgo(150),
    },
  ];

  const issues = [
    {
      _id: 'issue-101',
      title: 'Deep pothole near Adyar Signal bus stop',
      description:
        'A 2-foot wide pothole has formed right in the left lane approaching Adyar Signal. Two-wheelers are swerving abruptly to avoid it, creating a serious hazard during evening rush hour.',
      category: 'Pothole',
      status: 'In Progress',
      priority: 'Critical',
      department: 'Roads & Highways',
      location: {
        address: 'Sardar Patel Rd, Adyar Signal, Chennai',
        lat: 13.0067,
        lng: 80.2565,
      },
      photoUrl: '/uploads/seed-pothole.jpg',
      reportedBy: { userId: 'user-citizen-1', name: 'Arjun Karthik' },
      upvotes: ['user-citizen-1', 'user-citizen-2', 'user-citizen-3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12', 'u13', 'u14'],
      resolutionNote: 'Road maintenance crew dispatched with cold-mix asphalt. Scheduled for completion tonight.',
      comments: [
        {
          _id: 'c-1',
          userId: 'user-citizen-2',
          userName: 'Meera Sundaram',
          userRole: 'citizen',
          text: 'Almost lost balance on my scooter here yesterday evening. Really needs urgent patching.',
          createdAt: hoursAgo(18),
        },
        {
          _id: 'c-2',
          userId: 'user-admin-1',
          userName: 'Priya Ramanathan',
          userRole: 'admin',
          text: 'Thank you for reporting. Zone 13 Roads team has barricaded the spot and resurfacing begins at 10 PM.',
          createdAt: hoursAgo(6),
        },
      ],
      statusHistory: [
        { status: 'Open', note: 'Issue reported by citizen.', updatedBy: 'Arjun Karthik', updatedAt: hoursAgo(26) },
        {
          status: 'In Progress',
          note: 'Assigned to Roads & Highways Zone 13. Crew dispatched.',
          updatedBy: 'Priya Ramanathan',
          updatedAt: hoursAgo(6),
        },
      ],
      createdAt: hoursAgo(26),
      updatedAt: hoursAgo(6),
    },
    {
      _id: 'issue-102',
      title: 'Overflowing garbage bin on Pondy Bazaar cross street',
      description:
        'The municipal compactor bin near the north corner of Pondy Bazaar has not been cleared for 3 days. Waste is spilling onto the pedestrian walkway and attracting stray animals.',
      category: 'Garbage',
      status: 'Open',
      priority: 'High',
      department: 'Solid Waste Management',
      location: {
        address: 'Sir Thyagaraya Rd, Pondy Bazaar, T. Nagar',
        lat: 13.0418,
        lng: 80.2341,
      },
      photoUrl: '/uploads/seed-garbage.jpg',
      reportedBy: { userId: 'user-citizen-2', name: 'Meera Sundaram' },
      upvotes: ['user-citizen-2', 'user-citizen-1', 'user-citizen-3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'],
      resolutionNote: '',
      comments: [
        {
          _id: 'c-3',
          userId: 'user-citizen-3',
          userName: 'Vikram Nair',
          userRole: 'citizen',
          text: 'Upvoted! The smell is getting really bad for shopkeepers and pedestrians.',
          createdAt: hoursAgo(5),
        },
      ],
      statusHistory: [
        { status: 'Open', note: 'Issue reported by citizen.', updatedBy: 'Meera Sundaram', updatedAt: hoursAgo(14) },
      ],
      createdAt: hoursAgo(14),
      updatedAt: hoursAgo(5),
    },
    {
      _id: 'issue-103',
      title: 'Three consecutive streetlights out on 2nd Avenue',
      description:
        'Streetlight poles #42, #43, and #44 along Anna Nagar 2nd Avenue have been completely dark since last week, making the pedestrian crossing unsafe after 7 PM.',
      category: 'Streetlight',
      status: 'Open',
      priority: 'High',
      department: 'Electrical & Lighting',
      location: {
        address: '2nd Avenue, Near Roundtana, Anna Nagar',
        lat: 13.085,
        lng: 80.2101,
      },
      photoUrl: '/uploads/seed-streetlight.jpg',
      reportedBy: { userId: 'user-citizen-3', name: 'Vikram Nair' },
      upvotes: ['user-citizen-3', 'user-citizen-1', 'u4', 'u5', 'u6', 'u7'],
      resolutionNote: '',
      comments: [],
      statusHistory: [
        { status: 'Open', note: 'Issue reported by citizen.', updatedBy: 'Vikram Nair', updatedAt: hoursAgo(32) },
      ],
      createdAt: hoursAgo(32),
      updatedAt: hoursAgo(32),
    },
    {
      _id: 'issue-104',
      title: 'Burst drinking water pipeline flooding residential lane',
      description:
        'Clean water has been gushing out of an underground Metro Water valve since early morning, flooding 4th Cross Street and wasting thousands of liters.',
      category: 'Water Leak',
      status: 'Resolved',
      priority: 'Critical',
      department: 'Water Supply & Sewerage',
      location: {
        address: '4th Cross Street, Besant Nagar',
        lat: 13.0003,
        lng: 80.2667,
      },
      photoUrl: '/uploads/seed-waterleak.jpg',
      reportedBy: { userId: 'user-citizen-1', name: 'Arjun Karthik' },
      upvotes: ['user-citizen-1', 'user-citizen-2', 'user-citizen-3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'],
      resolutionNote: 'Damaged 150mm main valve replaced and pressure tested. Road cleared.',
      comments: [
        {
          _id: 'c-4',
          userId: 'user-admin-1',
          userName: 'Priya Ramanathan',
          userRole: 'admin',
          text: 'Emergency repair team completed the valve replacement. Water supply restored to normal pressure.',
          createdAt: hoursAgo(10),
        },
      ],
      statusHistory: [
        { status: 'Open', note: 'Issue reported by citizen.', updatedBy: 'Arjun Karthik', updatedAt: hoursAgo(48) },
        { status: 'In Progress', note: 'Metro Water emergency crew on site.', updatedBy: 'Priya Ramanathan', updatedAt: hoursAgo(24) },
        { status: 'Resolved', note: 'Damaged 150mm main valve replaced and pressure tested.', updatedBy: 'Priya Ramanathan', updatedAt: hoursAgo(10) },
      ],
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(10),
    },
    {
      _id: 'issue-105',
      title: 'Clogged stormwater drain causing waterlogging',
      description:
        'Plastic debris and silt have completely blocked the stormwater grate outside the railway subway entrance. Even light rain causes knee-deep waterlogging.',
      category: 'Drainage',
      status: 'In Progress',
      priority: 'Medium',
      department: 'Stormwater Drainage',
      location: {
        address: 'Velachery Main Rd, Near Vijayanagar Bus Stand',
        lat: 12.9791,
        lng: 80.2214,
      },
      photoUrl: '',
      reportedBy: { userId: 'user-citizen-2', name: 'Meera Sundaram' },
      upvotes: ['user-citizen-2', 'user-citizen-3', 'u4', 'u5'],
      resolutionNote: 'Desilting jet-rodding vehicle scheduled for morning shift.',
      comments: [],
      statusHistory: [
        { status: 'Open', note: 'Issue reported by citizen.', updatedBy: 'Meera Sundaram', updatedAt: hoursAgo(40) },
        { status: 'In Progress', note: 'Desilting crew assigned.', updatedBy: 'Priya Ramanathan', updatedAt: hoursAgo(12) },
      ],
      createdAt: hoursAgo(40),
      updatedAt: hoursAgo(12),
    },
    {
      _id: 'issue-106',
      title: 'Malfunctioning traffic signal stuck on red',
      description:
        'The northbound traffic signal at Kathipara approach is stuck on red for over 4 minutes per cycle, causing severe gridlock.',
      category: 'Traffic Signal',
      status: 'Resolved',
      priority: 'High',
      department: 'Traffic Engineering',
      location: {
        address: 'GST Road, Guindy Industrial Estate Junction',
        lat: 13.0085,
        lng: 80.2075,
      },
      photoUrl: '',
      reportedBy: { userId: 'user-citizen-3', name: 'Vikram Nair' },
      upvotes: ['user-citizen-3', 'user-citizen-1', 'user-citizen-2', 'u4', 'u5', 'u6', 'u7', 'u8'],
      resolutionNote: 'Signal controller timer recalibrated and faulty relay replaced.',
      comments: [],
      statusHistory: [
        { status: 'Open', note: 'Issue reported by citizen.', updatedBy: 'Vikram Nair', updatedAt: hoursAgo(72) },
        { status: 'Resolved', note: 'Controller timer recalibrated and verified.', updatedBy: 'Priya Ramanathan', updatedAt: hoursAgo(50) },
      ],
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(50),
    },
  ];

  return { users, issues };
}

module.exports = { getSeedData };
