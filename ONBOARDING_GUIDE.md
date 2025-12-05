# BizStep Onboarding System 🚀

## Overview
The onboarding system guides new users through a 6-step process to set up their profile and start their first business.

## User Flow

### Step 1: Welcome 👋
- **Purpose**: Introduce BizStep and its features
- **Content**:
  - Welcome message with rocket icon
  - Brief overview of app capabilities
  - Visual preview of 3 main features
- **Action**: Click "Get Started" to begin

### Step 2: Profile Setup 👤
- **Purpose**: Collect basic user information
- **Fields**:
  - **Display Name**: How the user wants to be addressed
  - **Country**: Select from 10+ countries (expandable)
  - **Currency**: Auto-set based on country selection
    - Nigeria → NGN (₦)
    - Kenya → KES (KSh)
    - Ghana → GHS (₵)
    - South Africa → ZAR (R)
    - And more...
- **Validation**: Both fields required
- **Data Saved**: User metadata in Supabase auth

### Step 3: Experience Level 📊
- **Purpose**: Tailor recommendations based on user's business experience
- **Options**:
  1. **Beginner** 🌱
     - New to business
     - Needs full guidance
  2. **Intermediate** 🌿
     - Some experience
     - Familiar with basics
  3. **Advanced** 🌳
     - Experienced entrepreneur
     - Knows the fundamentals
- **Validation**: Must select one level
- **Usage**: Influences difficulty recommendations and content complexity

### Step 4: Category Interest 🏷️
- **Purpose**: Filter business types by user interest
- **Categories** (10 total):
  - 🌾 Agriculture & Farming
  - 🍽️ Food Processing & Hospitality
  - 🛒 Retail & Trading
  - ✂️ Services & Personal Care
  - 🔨 Manufacturing & Crafts
  - 💻 Digital & Creative
  - 🚚 Transport & Logistics
  - 🏗️ Construction & Real Estate
  - ♻️ Green & Environmental
  - 🏥 Health & Social Services
- **Validation**: Must select one category
- **Effect**: Filters business list in next step

### Step 5: Business Selection 🏢
- **Purpose**: Choose specific business to start
- **Display**:
  - Filtered list based on selected category
  - Each business card shows:
    - Business name
    - Description
    - Difficulty badge (Easy/Medium/Hard)
    - Startup cost
    - Expected monthly profit
- **Features**:
  - Scrollable list if many options
  - Visual selection with checkmark
  - Optional custom business name field
- **Validation**: Must select one business
- **Data**: Business type ID saved for user_businesses table

### Step 6: Features Tour ✨
- **Purpose**: Showcase app capabilities
- **Features Highlighted**:
  1. **Business Roadmap** 📊
     - Step-by-step guides to launch
  2. **Financial Tracking** 💰
     - Track CAPEX, OPEX, Revenue
  3. **AI Advisor** 🤖
     - Personalized business advice
  4. **Loans & Savings** 🏦
     - Access to microfinance
  5. **Personal Wallet** 👛
     - Manage personal finances
  6. **Reports** 📈
     - Visual analytics and exports
- **Final Message**: Congratulations and encouragement
- **Action**: "Start My Business" button

## Completion Process

### What Happens on Completion:
1. **Update User Profile**:
   ```javascript
   {
     display_name: "User's Name",
     country: "NG",
     currency: "NGN",
     currency_symbol: "₦",
     experience_level: "Beginner",
     onboarding_completed: true
   }
   ```

2. **Create User Business**:
   ```javascript
   {
     user_id: "uuid",
     business_type_id: 123,
     name: "My Poultry Farm",
     budget: 5000,
     created_at: "2024-12-04T..."
   }
   ```

3. **Redirect**: Navigate to `/mybusiness` with business data

## Skip Functionality

### How It Works:
- "Skip" button available on every step
- Sets `onboarding_completed = true`
- Redirects to `/dashboard`
- User can start a business later from catalog

### Use Cases:
- User wants to explore first
- User already knows what they want
- User wants to complete later

## Technical Implementation

### Routes:
```javascript
/onboarding - Protected route with skipOnboarding flag
```

### Protection Logic:
```javascript
// In ProtectedRoute component
if (!onboardingCompleted && path !== '/onboarding') {
  redirect to '/onboarding'
}
```

### State Management:
- Local state for form data
- React Query for business types
- Supabase for persistence

### Animations:
- Framer Motion for smooth transitions
- Progress bar animation
- Step transitions
- Feature cards stagger

## Database Schema Requirements

### User Metadata (auth.users.raw_user_meta_data):
```json
{
  "display_name": "string",
  "country": "string",
  "currency": "string",
  "currency_symbol": "string",
  "experience_level": "string",
  "onboarding_completed": "boolean",
  "role": "string"
}
```

### User Businesses Table:
```sql
CREATE TABLE user_businesses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  business_type_id BIGINT REFERENCES business_types(id),
  name TEXT NOT NULL,
  budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Experience Features

### Progress Tracking:
- Visual progress bar (Step X of 6)
- Percentage completion indicator
- Step numbers clearly visible

### Validation:
- "Continue" button disabled until step is valid
- Clear visual feedback on selection
- Required field indicators

### Navigation:
- Back button (disabled on step 1)
- Continue button (changes to "Start My Business" on step 6)
- Skip button always available

### Visual Design:
- Gradient background
- Card-based layout
- Icon-driven interface
- Color-coded selections (blue for selected)
- Smooth animations

## Integration Points

### With Home Page:
- Business catalog uses same categories
- Consistent business card design
- Same data source (business_types table)

### With My Business Page:
- Receives selected business data
- Sets up initial roadmap
- Displays business metrics

### With Dashboard:
- Shows onboarding completion status
- Can trigger onboarding restart if needed

## Future Enhancements

### Potential Additions:
1. **Custom Business Creation**
   - Allow users to create businesses not in catalog
   - Custom startup cost and profit estimates

2. **Multi-Business Support**
   - Select multiple businesses
   - Comparison view

3. **Onboarding Analytics**
   - Track completion rates
   - Identify drop-off points
   - A/B test different flows

4. **Personalized Recommendations**
   - AI-suggested businesses based on profile
   - Match experience level to difficulty

5. **Video Tutorials**
   - Embedded videos in each step
   - Interactive walkthroughs

## Testing Checklist

- [ ] All 6 steps navigate correctly
- [ ] Back button works (except step 1)
- [ ] Skip button redirects to dashboard
- [ ] Form validation prevents invalid progression
- [ ] Country selection updates currency
- [ ] Category selection filters businesses
- [ ] Business selection shows in step 6
- [ ] Completion creates user_business record
- [ ] Completion updates user metadata
- [ ] Redirect to My Business works
- [ ] Onboarding check prevents re-entry
- [ ] Progress bar animates correctly
- [ ] Animations are smooth
- [ ] Mobile responsive design

## Support & Troubleshooting

### Common Issues:

**Issue**: User stuck in onboarding loop
- **Solution**: Check `onboarding_completed` flag in database

**Issue**: Business not created
- **Solution**: Verify user_businesses table permissions

**Issue**: Currency not updating
- **Solution**: Check country-currency mapping

**Issue**: Can't proceed to next step
- **Solution**: Verify all required fields are filled

## Conclusion

The onboarding system provides a smooth, guided experience for new users to:
1. Set up their profile
2. Choose their business interest
3. Select a specific business to start
4. Understand app features
5. Begin their entrepreneurial journey

It's designed to be:
- **User-friendly**: Clear steps and visual feedback
- **Flexible**: Skip option available
- **Informative**: Showcases app capabilities
- **Efficient**: 6 steps to get started
- **Beautiful**: Modern UI with animations
