import { useState, useMemo } from 'react'
import { Search, TrendingUp, DollarSign, Clock, Plus, Loader2, Info, X, Download, CheckCircle, AlertTriangle, FileText, Video, Globe, ExternalLink, Tag, Lock } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useCurrency } from '../contexts/CurrencyContext'
import { useNavigate } from 'react-router-dom'
import { useBusinessTypes, useAuth } from '../hooks/useSupabase'

// Business overview data - what you need to know for each business type
const getBusinessOverview = (business, formatCurrency) => {
  // Generic overview structure - can be customized per business type in the future
  const overviews = {
    'Poultry Farming': {
      basics: [
        'Raising chickens for eggs (layers) or meat (broilers)',
        'Requires proper housing, feeding, and disease management',
        'Can start small and scale up gradually',
        'High demand product with consistent market'
      ],
      requirements: [
        'Land or space for chicken coop (minimum 100 sq ft for 50 birds)',
        'Poultry housing/coop with proper ventilation',
        'Feeders and drinkers',
        'Day-old chicks or point-of-lay birds',
        'Feed (starter, grower, finisher)',
        'Vaccines and medications',
        'Lighting system for layers'
      ],
      tips: [
        'Start with 50-100 birds to learn the business',
        'Maintain strict biosecurity measures',
        'Keep detailed records of feed, mortality, and sales',
        'Build relationships with feed suppliers for better prices'
      ]
    },
    'Fish Farming': {
      basics: [
        'Raising fish in controlled environments for food',
        'Popular species: Tilapia, Catfish, Carp',
        'Can be done in ponds, tanks, or cages',
        'Growing demand for fresh fish protein'
      ],
      requirements: [
        'Fish pond or tanks (concrete, plastic, or earthen)',
        'Water source and quality management system',
        'Fingerlings (baby fish) from certified hatchery',
        'Fish feed (floating or sinking pellets)',
        'Aerators for oxygen supply',
        'Nets and harvesting equipment',
        'Water testing kit'
      ],
      tips: [
        'Start with hardy species like Tilapia or Catfish',
        'Monitor water quality daily (pH, oxygen, temperature)',
        'Feed fish 2-3 times daily at consistent times',
        'Plan your market before stocking fish'
      ]
    }
  }

  // Return specific overview or generate generic one
  return overviews[business.name] || {
    basics: [
      `${business.name} is a ${business.difficulty.toLowerCase()}-difficulty business`,
      `Part of the ${business.category} sector`,
      business.description,
      `Estimated startup cost: ${formatCurrency(business.startup_cost)}`
    ],
    requirements: [
      'Business registration and licenses',
      'Suitable location or workspace',
      'Initial inventory or equipment',
      'Working capital for first 3 months',
      'Marketing materials and branding',
      'Record keeping system'
    ],
    tips: [
      'Research your local market thoroughly',
      'Start small and grow gradually',
      'Keep detailed financial records',
      'Build relationships with suppliers and customers',
      'Reinvest profits for sustainable growth'
    ]
  }
}

// Complete business types data
const sampleBusinessTypes = [
  // Agriculture & Farming
  { id: 1, name: 'Poultry Farming', category: 'Agriculture & Farming', startupCost: 5000, monthlyProfit: 1200, difficulty: 'Medium', description: 'Raise chickens for eggs and meat production' },
  { id: 2, name: 'Fish Farming', category: 'Agriculture & Farming', startupCost: 8000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Aquaculture business for commercial fish production' },
  { id: 3, name: 'Vegetable Farming', category: 'Agriculture & Farming', startupCost: 2000, monthlyProfit: 800, difficulty: 'Easy', description: 'Grow and sell fresh vegetables' },
  { id: 4, name: 'Snail Farming', category: 'Agriculture & Farming', startupCost: 1500, monthlyProfit: 600, difficulty: 'Easy', description: 'Breed snails for food and export' },
  { id: 5, name: 'Mushroom Farming', category: 'Agriculture & Farming', startupCost: 2000, monthlyProfit: 700, difficulty: 'Medium', description: 'Cultivate mushrooms for sale' },
  { id: 6, name: 'Bee Keeping', category: 'Agriculture & Farming', startupCost: 3000, monthlyProfit: 900, difficulty: 'Medium', description: 'Produce honey and beeswax products' },
  { id: 7, name: 'Rabbit Farming', category: 'Agriculture & Farming', startupCost: 2500, monthlyProfit: 750, difficulty: 'Easy', description: 'Breed rabbits for meat and fur' },
  { id: 8, name: 'Pig Farming', category: 'Agriculture & Farming', startupCost: 6000, monthlyProfit: 1400, difficulty: 'Medium', description: 'Raise pigs for pork production' },
  { id: 9, name: 'Goat Farming', category: 'Agriculture & Farming', startupCost: 4000, monthlyProfit: 1000, difficulty: 'Medium', description: 'Breed goats for meat and milk' },
  { id: 10, name: 'Cattle Rearing', category: 'Agriculture & Farming', startupCost: 15000, monthlyProfit: 2500, difficulty: 'Hard', description: 'Raise cattle for beef and dairy' },
  { id: 11, name: 'Grasscutter Farming', category: 'Agriculture & Farming', startupCost: 2000, monthlyProfit: 650, difficulty: 'Easy', description: 'Breed grasscutters for meat' },
  { id: 12, name: 'Plantain/Banana Farming', category: 'Agriculture & Farming', startupCost: 3000, monthlyProfit: 900, difficulty: 'Easy', description: 'Cultivate plantain and banana crops' },
  { id: 13, name: 'Cassava Processing', category: 'Agriculture & Farming', startupCost: 4000, monthlyProfit: 1100, difficulty: 'Medium', description: 'Process cassava into garri and flour' },
  { id: 14, name: 'Rice Farming', category: 'Agriculture & Farming', startupCost: 5000, monthlyProfit: 1200, difficulty: 'Medium', description: 'Cultivate rice for commercial sale' },
  { id: 15, name: 'Palm Oil Production', category: 'Agriculture & Farming', startupCost: 8000, monthlyProfit: 1800, difficulty: 'Hard', description: 'Process palm fruits into oil' },

  // Food Processing & Hospitality
  { id: 16, name: 'Restaurant/Food Joint', category: 'Food Processing & Hospitality', startupCost: 5000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Serve meals and refreshments' },
  { id: 17, name: 'Bakery', category: 'Food Processing & Hospitality', startupCost: 6000, monthlyProfit: 1400, difficulty: 'Medium', description: 'Bake and sell bread, cakes, and pastries' },
  { id: 18, name: 'Catering Services', category: 'Food Processing & Hospitality', startupCost: 3000, monthlyProfit: 1200, difficulty: 'Easy', description: 'Provide food for events and parties' },
  { id: 19, name: 'Food Truck', category: 'Food Processing & Hospitality', startupCost: 8000, monthlyProfit: 1800, difficulty: 'Medium', description: 'Mobile food service business' },
  { id: 20, name: 'Juice/Smoothie Bar', category: 'Food Processing & Hospitality', startupCost: 3500, monthlyProfit: 1000, difficulty: 'Easy', description: 'Serve fresh juices and smoothies' },
  { id: 21, name: 'Ice Cream Shop', category: 'Food Processing & Hospitality', startupCost: 4000, monthlyProfit: 1100, difficulty: 'Easy', description: 'Sell ice cream and frozen treats' },
  { id: 22, name: 'Coffee Shop', category: 'Food Processing & Hospitality', startupCost: 5000, monthlyProfit: 1300, difficulty: 'Medium', description: 'Serve coffee and light refreshments' },
  { id: 23, name: 'Fast Food', category: 'Food Processing & Hospitality', startupCost: 7000, monthlyProfit: 1600, difficulty: 'Medium', description: 'Quick service restaurant' },
  { id: 24, name: 'Grains Processing', category: 'Food Processing & Hospitality', startupCost: 4500, monthlyProfit: 1000, difficulty: 'Medium', description: 'Process and package grains' },
  { id: 25, name: 'Spice Production', category: 'Food Processing & Hospitality', startupCost: 2000, monthlyProfit: 700, difficulty: 'Easy', description: 'Produce and package spices' },
  { id: 26, name: 'Snacks Production', category: 'Food Processing & Hospitality', startupCost: 2500, monthlyProfit: 800, difficulty: 'Easy', description: 'Make and sell packaged snacks' },
  { id: 27, name: 'Bottled Water', category: 'Food Processing & Hospitality', startupCost: 10000, monthlyProfit: 2000, difficulty: 'Hard', description: 'Bottle and distribute water' },
  { id: 28, name: 'Food Preservation', category: 'Food Processing & Hospitality', startupCost: 3000, monthlyProfit: 850, difficulty: 'Medium', description: 'Preserve and package food items' },

  // Retail & Trading
  { id: 29, name: 'Mini Supermarket', category: 'Retail & Trading', startupCost: 10000, monthlyProfit: 2000, difficulty: 'Medium', description: 'Sell groceries and household items' },
  { id: 30, name: 'Boutique/Clothing Store', category: 'Retail & Trading', startupCost: 5000, monthlyProfit: 1200, difficulty: 'Easy', description: 'Sell fashion and clothing items' },
  { id: 31, name: 'Cosmetics Shop', category: 'Retail & Trading', startupCost: 4000, monthlyProfit: 1000, difficulty: 'Easy', description: 'Retail beauty and cosmetic products' },
  { id: 32, name: 'Phone & Accessories', category: 'Retail & Trading', startupCost: 3500, monthlyProfit: 900, difficulty: 'Easy', description: 'Sell phones and accessories' },
  { id: 33, name: 'Bookshop', category: 'Retail & Trading', startupCost: 4000, monthlyProfit: 800, difficulty: 'Easy', description: 'Sell books and educational materials' },
  { id: 34, name: 'Stationery Shop', category: 'Retail & Trading', startupCost: 3000, monthlyProfit: 750, difficulty: 'Easy', description: 'Sell office and school supplies' },
  { id: 35, name: 'Pharmacy', category: 'Retail & Trading', startupCost: 15000, monthlyProfit: 2500, difficulty: 'Hard', description: 'Dispense medications and health products' },
  { id: 36, name: 'Electronics/Hardware Store', category: 'Retail & Trading', startupCost: 10000, monthlyProfit: 1800, difficulty: 'Medium', description: 'Sell electronics and hardware' },
  { id: 37, name: 'Auto Parts Store', category: 'Retail & Trading', startupCost: 8000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Sell vehicle parts and accessories' },
  { id: 38, name: 'Furniture Shop', category: 'Retail & Trading', startupCost: 12000, monthlyProfit: 2200, difficulty: 'Medium', description: 'Sell home and office furniture' },
  { id: 39, name: 'Building Materials', category: 'Retail & Trading', startupCost: 20000, monthlyProfit: 3000, difficulty: 'Hard', description: 'Sell construction materials' },
  { id: 40, name: 'Wholesale Trading', category: 'Retail & Trading', startupCost: 15000, monthlyProfit: 2500, difficulty: 'Medium', description: 'Buy and sell goods in bulk' },
  { id: 41, name: 'Import/Export', category: 'Retail & Trading', startupCost: 25000, monthlyProfit: 4000, difficulty: 'Hard', description: 'International trade business' },
  { id: 42, name: 'Printing & Photocopy Shop', category: 'Retail & Trading', startupCost: 3500, monthlyProfit: 850, difficulty: 'Easy', description: 'Printing and document services' },

  // Services & Personal Care
  { id: 43, name: 'Hair Salon', category: 'Services & Personal Care', startupCost: 3000, monthlyProfit: 1000, difficulty: 'Easy', description: 'Hair styling and treatment services' },
  { id: 44, name: 'Barber Shop', category: 'Services & Personal Care', startupCost: 2500, monthlyProfit: 800, difficulty: 'Easy', description: 'Men\'s grooming services' },
  { id: 45, name: 'Spa & Massage', category: 'Services & Personal Care', startupCost: 5000, monthlyProfit: 1300, difficulty: 'Medium', description: 'Relaxation and wellness services' },
  { id: 46, name: 'Makeup Artist', category: 'Services & Personal Care', startupCost: 2000, monthlyProfit: 900, difficulty: 'Easy', description: 'Professional makeup services' },
  { id: 47, name: 'Nail Technician', category: 'Services & Personal Care', startupCost: 1500, monthlyProfit: 700, difficulty: 'Easy', description: 'Manicure and pedicure services' },
  { id: 48, name: 'Tailoring', category: 'Services & Personal Care', startupCost: 2000, monthlyProfit: 700, difficulty: 'Easy', description: 'Sewing and alterations' },
  { id: 49, name: 'Fashion Design', category: 'Services & Personal Care', startupCost: 3500, monthlyProfit: 1100, difficulty: 'Medium', description: 'Custom clothing design' },
  { id: 50, name: 'Laundry/Dry Cleaning', category: 'Services & Personal Care', startupCost: 4000, monthlyProfit: 1000, difficulty: 'Medium', description: 'Clothes cleaning services' },
  { id: 51, name: 'Car Wash', category: 'Services & Personal Care', startupCost: 3000, monthlyProfit: 900, difficulty: 'Easy', description: 'Vehicle cleaning services' },
  { id: 52, name: 'Event Planning', category: 'Services & Personal Care', startupCost: 2000, monthlyProfit: 1200, difficulty: 'Easy', description: 'Organize events and parties' },
  { id: 53, name: 'Photography', category: 'Services & Personal Care', startupCost: 4000, monthlyProfit: 1100, difficulty: 'Medium', description: 'Professional photography services' },
  { id: 54, name: 'Cleaning Services', category: 'Services & Personal Care', startupCost: 1500, monthlyProfit: 800, difficulty: 'Easy', description: 'Home and office cleaning' },
  { id: 55, name: 'Gardening', category: 'Services & Personal Care', startupCost: 2000, monthlyProfit: 750, difficulty: 'Easy', description: 'Landscaping and garden maintenance' },
  { id: 56, name: 'Security Services', category: 'Services & Personal Care', startupCost: 5000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Provide security personnel' },
  { id: 57, name: 'Tutoring', category: 'Services & Personal Care', startupCost: 500, monthlyProfit: 600, difficulty: 'Easy', description: 'Educational tutoring services' },

  // Manufacturing & Crafts
  { id: 58, name: 'Furniture Making', category: 'Manufacturing & Crafts', startupCost: 5000, monthlyProfit: 1200, difficulty: 'Medium', description: 'Craft custom furniture' },
  { id: 59, name: 'Welding/Fabrication', category: 'Manufacturing & Crafts', startupCost: 4000, monthlyProfit: 1000, difficulty: 'Medium', description: 'Metal fabrication services' },
  { id: 60, name: 'Leather Works', category: 'Manufacturing & Crafts', startupCost: 3000, monthlyProfit: 900, difficulty: 'Medium', description: 'Create leather products' },
  { id: 61, name: 'Jewelry Making', category: 'Manufacturing & Crafts', startupCost: 2500, monthlyProfit: 850, difficulty: 'Easy', description: 'Design and craft jewelry' },
  { id: 62, name: 'Pottery/Ceramics', category: 'Manufacturing & Crafts', startupCost: 2000, monthlyProfit: 700, difficulty: 'Medium', description: 'Create ceramic products' },
  { id: 63, name: 'Candle Making', category: 'Manufacturing & Crafts', startupCost: 1500, monthlyProfit: 600, difficulty: 'Easy', description: 'Produce decorative candles' },
  { id: 64, name: 'Soap/Detergent Production', category: 'Manufacturing & Crafts', startupCost: 2500, monthlyProfit: 800, difficulty: 'Easy', description: 'Manufacture cleaning products' },
  { id: 65, name: 'Cosmetics Production', category: 'Manufacturing & Crafts', startupCost: 3000, monthlyProfit: 900, difficulty: 'Medium', description: 'Produce beauty products' },
  { id: 66, name: 'Block Moulding', category: 'Manufacturing & Crafts', startupCost: 4000, monthlyProfit: 1000, difficulty: 'Medium', description: 'Manufacture building blocks' },
  { id: 67, name: 'Packaging Business', category: 'Manufacturing & Crafts', startupCost: 3500, monthlyProfit: 850, difficulty: 'Medium', description: 'Produce packaging materials' },
  { id: 68, name: 'Printing Press', category: 'Manufacturing & Crafts', startupCost: 8000, monthlyProfit: 1500, difficulty: 'Hard', description: 'Commercial printing services' },
  { id: 69, name: 'Shoe Making', category: 'Manufacturing & Crafts', startupCost: 3000, monthlyProfit: 900, difficulty: 'Medium', description: 'Craft custom footwear' },
  { id: 70, name: 'Bag Making', category: 'Manufacturing & Crafts', startupCost: 2500, monthlyProfit: 800, difficulty: 'Easy', description: 'Produce bags and purses' },
  { id: 71, name: 'Art & Decor', category: 'Manufacturing & Crafts', startupCost: 1500, monthlyProfit: 700, difficulty: 'Easy', description: 'Create decorative art pieces' },
  { id: 72, name: 'Textile/Adire', category: 'Manufacturing & Crafts', startupCost: 2000, monthlyProfit: 750, difficulty: 'Easy', description: 'Produce traditional textiles' },

  // Digital & Creative
  { id: 73, name: 'Web Development', category: 'Digital & Creative', startupCost: 1000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Build websites and web apps' },
  { id: 74, name: 'Graphic Design', category: 'Digital & Creative', startupCost: 1500, monthlyProfit: 1000, difficulty: 'Easy', description: 'Create visual designs' },
  { id: 75, name: 'Social Media Management', category: 'Digital & Creative', startupCost: 500, monthlyProfit: 800, difficulty: 'Easy', description: 'Manage social media accounts' },
  { id: 76, name: 'Content Creation', category: 'Digital & Creative', startupCost: 1000, monthlyProfit: 900, difficulty: 'Easy', description: 'Create digital content' },
  { id: 77, name: 'Video Production', category: 'Digital & Creative', startupCost: 5000, monthlyProfit: 1400, difficulty: 'Medium', description: 'Produce video content' },
  { id: 78, name: 'Computer Repair', category: 'Digital & Creative', startupCost: 3000, monthlyProfit: 900, difficulty: 'Medium', description: 'Fix computers and devices' },
  { id: 79, name: 'IT Training', category: 'Digital & Creative', startupCost: 3500, monthlyProfit: 1100, difficulty: 'Medium', description: 'Teach technology skills' },
  { id: 80, name: 'E-commerce', category: 'Digital & Creative', startupCost: 2000, monthlyProfit: 1200, difficulty: 'Easy', description: 'Sell products online' },
  { id: 81, name: 'App Development', category: 'Digital & Creative', startupCost: 2000, monthlyProfit: 2000, difficulty: 'Hard', description: 'Build mobile applications' },
  { id: 82, name: 'Digital Marketing', category: 'Digital & Creative', startupCost: 1000, monthlyProfit: 1100, difficulty: 'Easy', description: 'Online marketing services' },
  { id: 83, name: 'Online Tutoring', category: 'Digital & Creative', startupCost: 500, monthlyProfit: 700, difficulty: 'Easy', description: 'Teach online courses' },
  { id: 84, name: 'Podcast Production', category: 'Digital & Creative', startupCost: 2000, monthlyProfit: 800, difficulty: 'Medium', description: 'Produce podcast content' },

  // Transport & Logistics
  { id: 85, name: 'Taxi/Ride Sharing', category: 'Transport & Logistics', startupCost: 8000, monthlyProfit: 1200, difficulty: 'Medium', description: 'Passenger transportation' },
  { id: 86, name: 'Delivery Services', category: 'Transport & Logistics', startupCost: 3000, monthlyProfit: 900, difficulty: 'Easy', description: 'Package delivery business' },
  { id: 87, name: 'Trucking/Haulage', category: 'Transport & Logistics', startupCost: 25000, monthlyProfit: 3500, difficulty: 'Hard', description: 'Heavy goods transportation' },
  { id: 88, name: 'Motorcycle Courier', category: 'Transport & Logistics', startupCost: 2000, monthlyProfit: 700, difficulty: 'Easy', description: 'Fast delivery service' },
  { id: 89, name: 'Bus Transport', category: 'Transport & Logistics', startupCost: 30000, monthlyProfit: 4000, difficulty: 'Hard', description: 'Public transportation service' },
  { id: 90, name: 'Car Rental', category: 'Transport & Logistics', startupCost: 20000, monthlyProfit: 2500, difficulty: 'Medium', description: 'Vehicle rental service' },
  { id: 91, name: 'Logistics Company', category: 'Transport & Logistics', startupCost: 15000, monthlyProfit: 2000, difficulty: 'Hard', description: 'Supply chain management' },
  { id: 92, name: 'Moving Services', category: 'Transport & Logistics', startupCost: 5000, monthlyProfit: 1100, difficulty: 'Medium', description: 'Relocation services' },

  // Construction & Real Estate
  { id: 93, name: 'Building Construction', category: 'Construction & Real Estate', startupCost: 20000, monthlyProfit: 3500, difficulty: 'Hard', description: 'Construction services' },
  { id: 94, name: 'Plumbing Services', category: 'Construction & Real Estate', startupCost: 3000, monthlyProfit: 900, difficulty: 'Medium', description: 'Plumbing installation and repair' },
  { id: 95, name: 'Electrical Services', category: 'Construction & Real Estate', startupCost: 3500, monthlyProfit: 1000, difficulty: 'Medium', description: 'Electrical work' },
  { id: 96, name: 'Painting Services', category: 'Construction & Real Estate', startupCost: 2000, monthlyProfit: 800, difficulty: 'Easy', description: 'Interior and exterior painting' },
  { id: 97, name: 'Interior Design', category: 'Construction & Real Estate', startupCost: 5000, monthlyProfit: 1300, difficulty: 'Medium', description: 'Space design services' },
  { id: 98, name: 'Property Management', category: 'Construction & Real Estate', startupCost: 5000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Manage rental properties' },
  { id: 99, name: 'Real Estate Agency', category: 'Construction & Real Estate', startupCost: 3000, monthlyProfit: 2000, difficulty: 'Easy', description: 'Property sales and rentals' },
  { id: 100, name: 'Masonry', category: 'Construction & Real Estate', startupCost: 3000, monthlyProfit: 1000, difficulty: 'Medium', description: 'Bricklaying services' },
  { id: 101, name: 'Tiling Services', category: 'Construction & Real Estate', startupCost: 2500, monthlyProfit: 900, difficulty: 'Easy', description: 'Floor and wall tiling' },
  { id: 102, name: 'Roofing Services', category: 'Construction & Real Estate', startupCost: 4000, monthlyProfit: 1100, difficulty: 'Medium', description: 'Roof installation and repair' },

  // Green & Environmental
  { id: 103, name: 'Recycling Business', category: 'Green & Environmental', startupCost: 5000, monthlyProfit: 1200, difficulty: 'Medium', description: 'Waste recycling services' },
  { id: 104, name: 'Solar Installation', category: 'Green & Environmental', startupCost: 10000, monthlyProfit: 2000, difficulty: 'Hard', description: 'Install solar energy systems' },
  { id: 105, name: 'Organic Farming', category: 'Green & Environmental', startupCost: 4000, monthlyProfit: 1100, difficulty: 'Medium', description: 'Chemical-free agriculture' },
  { id: 106, name: 'Waste Management', category: 'Green & Environmental', startupCost: 8000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Waste collection and disposal' },
  { id: 107, name: 'Water Treatment', category: 'Green & Environmental', startupCost: 12000, monthlyProfit: 2200, difficulty: 'Hard', description: 'Water purification services' },
  { id: 108, name: 'Environmental Consulting', category: 'Green & Environmental', startupCost: 2000, monthlyProfit: 1000, difficulty: 'Easy', description: 'Environmental advisory' },
  { id: 109, name: 'Composting', category: 'Green & Environmental', startupCost: 3000, monthlyProfit: 800, difficulty: 'Easy', description: 'Organic waste composting' },
  { id: 110, name: 'Green Energy Products', category: 'Green & Environmental', startupCost: 6000, monthlyProfit: 1300, difficulty: 'Medium', description: 'Sell eco-friendly products' },

  // Health & Social Services
  { id: 111, name: 'Clinic/Health Center', category: 'Health & Social Services', startupCost: 30000, monthlyProfit: 5000, difficulty: 'Hard', description: 'Medical care facility' },
  { id: 112, name: 'Pharmacy', category: 'Health & Social Services', startupCost: 15000, monthlyProfit: 2500, difficulty: 'Hard', description: 'Dispense medications' },
  { id: 113, name: 'Diagnostic Center', category: 'Health & Social Services', startupCost: 50000, monthlyProfit: 6000, difficulty: 'Hard', description: 'Medical testing facility' },
  { id: 114, name: 'Physiotherapy', category: 'Health & Social Services', startupCost: 8000, monthlyProfit: 1800, difficulty: 'Medium', description: 'Physical therapy services' },
  { id: 115, name: 'Home Care Services', category: 'Health & Social Services', startupCost: 3000, monthlyProfit: 1200, difficulty: 'Easy', description: 'In-home care for patients' },
  { id: 116, name: 'Daycare/Creche', category: 'Health & Social Services', startupCost: 5000, monthlyProfit: 1500, difficulty: 'Medium', description: 'Childcare services' },
  { id: 117, name: 'Elderly Care', category: 'Health & Social Services', startupCost: 6000, monthlyProfit: 1400, difficulty: 'Medium', description: 'Care for senior citizens' },
  { id: 118, name: 'Fitness Center', category: 'Health & Social Services', startupCost: 10000, monthlyProfit: 2000, difficulty: 'Medium', description: 'Gym and fitness facility' },
  { id: 119, name: 'Nutrition Consulting', category: 'Health & Social Services', startupCost: 1500, monthlyProfit: 900, difficulty: 'Easy', description: 'Dietary advice services' },
]

// Category icons mapping
const categoryIcons = {
  'Agriculture & Farming': '🌾',
  'Food Processing & Hospitality': '🍽️',
  'Retail & Trading': '🛒',
  'Services & Personal Care': '💆',
  'Manufacturing & Crafts': '🔨',
  'Digital & Creative': '💻',
  'Transport & Logistics': '🚚',
  'Construction & Real Estate': '🏗️',
  'Green & Environmental': '🌱',
  'Health & Social Services': '🏥',
}

export function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showOverview, setShowOverview] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const navigate = useNavigate()
  const { data: user } = useAuth()
  const { formatCurrency } = useCurrency()

  // Open overview modal
  const openOverview = (business) => {
    setSelectedBusiness(business)
    setShowOverview(true)
  }

  // Generate PDF download (placeholder - would need backend for real PDF)
  const handleDownloadPDF = () => {
    if (!selectedBusiness) return
    
    // Create a simple text content for download
    const overview = getBusinessOverview(selectedBusiness, formatCurrency)
    const content = `
${selectedBusiness.name.toUpperCase()} - BUSINESS OVERVIEW
${'='.repeat(50)}

CATEGORY: ${selectedBusiness.category}
DIFFICULTY: ${selectedBusiness.difficulty}
STARTUP COST: ${formatCurrency(selectedBusiness.startup_cost)}
EXPECTED MONTHLY PROFIT: ${formatCurrency(selectedBusiness.monthly_profit)}

DESCRIPTION:
${selectedBusiness.description}

WHAT YOU NEED TO KNOW:
${overview.basics.map((b, i) => `${i + 1}. ${b}`).join('\n')}

REQUIREMENTS:
${overview.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TIPS FOR SUCCESS:
${overview.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}

${'='.repeat(50)}
Generated by BizApp - Your Business Journey Partner
    `.trim()

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedBusiness.name.replace(/\s+/g, '_')}_Overview.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Fetch business types from database
  const { data: businessTypes, isLoading, error } = useBusinessTypes()
  
  // Extract unique categories from database
  const categories = useMemo(() => {
    if (!businessTypes) return []
    const uniqueCategories = [...new Set(businessTypes.map(b => b.category))]
    return uniqueCategories.sort()
  }, [businessTypes])

  const filteredBusinesses = useMemo(() => {
    if (!businessTypes) return []
    return businessTypes.filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           business.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [businessTypes, searchTerm, selectedCategory])

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Hard': 'bg-red-100 text-red-700'
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading business types...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-8 text-center">
            <p className="text-red-800 mb-4">Failed to load business types: {error.message}</p>
            <p className="text-sm text-red-600">Make sure you've run the database schema and seeded the data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Start Your Business Journey 🚀
        </h1>
        <p className="text-lg text-slate-600">
          Browse {businessTypes?.length || 0} business types across {categories.length} categories and get step-by-step guidance to launch your dream business
        </p>
      </div>

      {/* Sticky Search, Filter, and Custom Business Section */}
      <div className="sticky top-0 z-40 bg-slate-50 -mx-4 px-4 py-4 mb-6 border-b border-slate-200 shadow-sm">
        {/* Create Custom Business */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 mb-4">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Don't see your business idea?
              </h3>
              <p className="text-slate-600 text-sm">
                Create a custom business plan tailored to your unique vision
              </p>
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create Custom Business</span>
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search business types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="All">All Categories ({businessTypes?.length || 0})</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} ({businessTypes?.filter(b => b.category === category).length || 0})
                </option>
              ))}
            </select>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear filter
              </button>
            )}
            <span className="text-sm text-slate-500 ml-auto">
              Showing {filteredBusinesses.length} of {businessTypes?.length || 0} businesses
            </span>
          </div>
        </div>
      </div>

      {/* Business Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredBusinesses.map(business => {
          const breakevenMonths = business.startup_cost && business.monthly_profit 
            ? Math.ceil(business.startup_cost / business.monthly_profit) 
            : null
          
          return (
            <Card 
              key={business.id} 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Top Section - Image Area */}
              <div className="relative h-36 overflow-hidden">
                {/* Background Image with Zoom Effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    backgroundImage: business.image_url 
                      ? `url(${business.image_url})` 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Sign up to access badge - for non-authenticated users */}
                {!user && (
                  <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    <span>Sign up to access</span>
                  </div>
                )}
                
                {/* Difficulty Badge - top right */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  business.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                  business.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {business.difficulty === 'Easy' ? 'Beginner' : 
                   business.difficulty === 'Medium' ? 'Intermediate' : 'Advanced'}
                </div>
                
                {/* Category Icon - bottom left */}
                <div className="absolute bottom-2 left-2 text-2xl drop-shadow-lg">
                  {categoryIcons[business.category] || '📦'}
                </div>
              </div>

              {/* Bottom Section - Description Area */}
              <CardContent className="p-4">
                {/* Sub-sector Badge */}
                <div className="flex items-center space-x-1 text-xs text-blue-600 mb-2">
                  <Tag className="h-3 w-3" />
                  <span className="font-medium">{business.category}</span>
                </div>
                
                {/* Business Name */}
                <h3 className="text-lg font-bold text-slate-900 mb-1">{business.name}</h3>
                
                {/* Main Category Label */}
                <p className="text-xs text-slate-500 mb-2">{business.category}</p>
                
                {/* Description - 2 lines */}
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{business.description}</p>
                
                {/* Financial Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-slate-600">Startup:</span>
                    <span className="font-semibold text-slate-900 ml-auto">
                      {formatCurrency(business.startup_cost)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-slate-600">Monthly Profit:</span>
                    <span className="font-semibold text-green-600 ml-auto">
                      {formatCurrency(business.monthly_profit)}
                    </span>
                  </div>
                  {breakevenMonths && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-slate-600">Breakeven:</span>
                      <span className="font-semibold text-orange-600 ml-auto">
                        ~{breakevenMonths} months
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {user ? (
                  <Button 
                    className="w-full"
                    onClick={() => openOverview(business)}
                  >
                    View Details
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate('/register')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Sign Up to View
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Business Overview Modal */}
      {showOverview && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedBusiness.name}</h2>
                <p className="text-slate-600">{selectedBusiness.category}</p>
              </div>
              <button 
                onClick={() => setShowOverview(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-slate-600">Startup Cost</p>
                  <p className="font-bold text-slate-900">{formatCurrency(selectedBusiness.startup_cost)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-slate-600">Monthly Profit</p>
                  <p className="font-bold text-green-600">{formatCurrency(selectedBusiness.monthly_profit)}</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${difficultyColors[selectedBusiness.difficulty]?.replace('text-', 'bg-').replace('700', '50')}`}>
                  <AlertTriangle className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm">Difficulty</p>
                  <p className="font-bold">{selectedBusiness.difficulty}</p>
                </div>
              </div>

              {/* Resource Links - YouTube, Web, PDF */}
              {(selectedBusiness.overview_video_url || selectedBusiness.overview_web_url || selectedBusiness.overview_pdf_url) && (
                <div className="flex flex-wrap gap-3">
                  {selectedBusiness.overview_video_url && (
                    <a
                      href={selectedBusiness.overview_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Video className="h-5 w-5" />
                      <span className="font-medium">Watch Video</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {selectedBusiness.overview_web_url && (
                    <a
                      href={selectedBusiness.overview_web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="font-medium">Learn More</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {selectedBusiness.overview_pdf_url && (
                    <a
                      href={selectedBusiness.overview_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span className="font-medium">Download PDF Guide</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Database Overview Content (if available) */}
              {selectedBusiness.overview_content ? (
                <div className="bg-slate-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <Info className="h-5 w-5 text-blue-600 mr-2" />
                    Business Overview
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none">
                    {selectedBusiness.overview_content.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h4 key={i} className="text-md font-semibold text-slate-800 mt-4 mb-2">{line.replace('## ', '')}</h4>
                      } else if (line.startsWith('- ')) {
                        return <p key={i} className="flex items-start mb-1"><CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" /><span>{line.replace('- ', '')}</span></p>
                      } else if (line.match(/^\d+\. /)) {
                        return <p key={i} className="flex items-start mb-1"><span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">{line.match(/^\d+/)[0]}</span><span>{line.replace(/^\d+\. /, '')}</span></p>
                      } else if (line.trim()) {
                        return <p key={i} className="text-slate-700 mb-2">{line}</p>
                      }
                      return null
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {/* Fallback: What You Need to Know */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <Info className="h-5 w-5 text-blue-600 mr-2" />
                      What You Need to Know
                    </h3>
                    <ul className="space-y-2">
                      {getBusinessOverview(selectedBusiness, formatCurrency).basics.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fallback: Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 text-orange-600 mr-2" />
                      What You'll Need
                    </h3>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {getBusinessOverview(selectedBusiness, formatCurrency).requirements.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-6 h-6 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-sm font-medium mr-2 flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Fallback: Tips for Success */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Tips for Success
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {getBusinessOverview(selectedBusiness, formatCurrency).tips.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-500 mr-2">💡</span>
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex items-center justify-between">
              <Button 
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Overview</span>
              </Button>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowOverview(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowOverview(false)
                    navigate('/onboarding', { state: { preSelectedBusiness: selectedBusiness } })
                  }}
                  className="flex items-center space-x-2"
                >
                  <span>Start This Business</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
