// Comprehensive Account Categorization Guide
// Helps users understand where to categorize different types of transactions

export const ACCOUNT_GUIDE = {
  // ASSETS (1000-1999)
  assets: {
    title: "Assets - What Your Business Owns",
    description: "Assets are resources owned by your business that have economic value. They can be converted to cash or used to generate revenue.",
    categories: {
      currentAssets: {
        title: "Current Assets (1000-1499)",
        description: "Assets that can be converted to cash within one year",
        accounts: [
          {
            code: "1000",
            name: "Cash",
            description: "Physical cash in hand or cash drawer",
            examples: ["Cash register money", "Petty cash drawer", "Cash on hand"],
            whenToUse: "When you receive or pay with physical cash"
          },
          {
            code: "1010",
            name: "Petty Cash",
            description: "Small amount of cash for minor expenses",
            examples: ["Office snacks", "Parking fees", "Small supplies"],
            whenToUse: "For small day-to-day expenses paid in cash"
          },
          {
            code: "1020-1040",
            name: "Bank Accounts",
            description: "Money in your business bank accounts",
            examples: ["Checking account balance", "Savings account", "Money market account"],
            whenToUse: "When money moves in/out of your bank accounts"
          },
          {
            code: "1100",
            name: "Accounts Receivable",
            description: "Money customers owe you for goods/services already delivered",
            examples: ["Unpaid invoices", "Credit sales", "Payment due from clients"],
            whenToUse: "When you sell on credit and haven't been paid yet"
          },
          {
            code: "1200",
            name: "Inventory",
            description: "Products you have for sale or materials to make products",
            examples: ["Products in warehouse", "Raw materials", "Work in progress", "Finished goods ready to sell"],
            whenToUse: "When you buy products to resell or materials to manufacture"
          },
          {
            code: "1300",
            name: "Prepaid Expenses",
            description: "Expenses you've paid in advance",
            examples: ["Prepaid rent for next 6 months", "Annual insurance paid upfront", "Prepaid subscriptions"],
            whenToUse: "When you pay for something before you use it"
          }
        ]
      },
      nonCurrentAssets: {
        title: "Non-Current Assets (1500-1999)",
        description: "Long-term assets used in business operations for more than one year",
        accounts: [
          {
            code: "1500-1570",
            name: "Property, Plant & Equipment",
            description: "Physical assets used in business operations",
            examples: ["Office building", "Factory machinery", "Delivery vehicles", "Office furniture", "Computers", "Warehouse"],
            whenToUse: "When you buy equipment, buildings, or vehicles for business use"
          },
          {
            code: "1600-1640",
            name: "Accumulated Depreciation",
            description: "Total wear and tear on your assets over time (reduces asset value)",
            examples: ["Depreciation on building", "Vehicle depreciation", "Equipment wear"],
            whenToUse: "Monthly/yearly to record asset value decrease"
          },
          {
            code: "1700-1740",
            name: "Intangible Assets",
            description: "Non-physical assets with value",
            examples: ["Software licenses", "Patents", "Trademarks", "Brand value (goodwill)", "Website"],
            whenToUse: "When you buy software, patents, or acquire brand value"
          },
          {
            code: "1800",
            name: "Long-term Investments",
            description: "Investments held for more than one year",
            examples: ["Stocks held long-term", "Bonds", "Investment in other companies"],
            whenToUse: "When you invest company money for long-term growth"
          }
        ]
      }
    }
  },

  // LIABILITIES (2000-2999)
  liabilities: {
    title: "Liabilities - What Your Business Owes",
    description: "Liabilities are debts and obligations your business owes to others. Money you need to pay back.",
    categories: {
      currentLiabilities: {
        title: "Current Liabilities (2000-2499)",
        description: "Debts due within one year",
        accounts: [
          {
            code: "2000",
            name: "Accounts Payable",
            description: "Money you owe suppliers for goods/services received",
            examples: ["Unpaid supplier invoices", "Bills not yet paid", "Credit purchases"],
            whenToUse: "When you buy on credit and haven't paid yet"
          },
          {
            code: "2100",
            name: "Accrued Expenses",
            description: "Expenses incurred but not yet paid",
            examples: ["Unpaid salaries", "Utility bills not yet paid", "Interest owed"],
            whenToUse: "When you've received a service but haven't paid the bill"
          },
          {
            code: "2200-2240",
            name: "Taxes Payable",
            description: "Taxes you owe to government",
            examples: ["Income tax due", "Sales tax collected from customers", "Payroll taxes", "VAT to pay"],
            whenToUse: "When you collect tax or owe tax to authorities"
          },
          {
            code: "2300",
            name: "Short-term Loans",
            description: "Loans due within one year",
            examples: ["Bank overdraft", "Credit card balance", "Short-term business loan"],
            whenToUse: "When you borrow money due back within 12 months"
          },
          {
            code: "2400",
            name: "Deferred Revenue",
            description: "Money received before delivering goods/services",
            examples: ["Customer deposits", "Prepaid subscriptions", "Advance payments"],
            whenToUse: "When customers pay you before you deliver"
          }
        ]
      },
      nonCurrentLiabilities: {
        title: "Non-Current Liabilities (2500-2999)",
        description: "Long-term debts due after one year",
        accounts: [
          {
            code: "2500",
            name: "Long-term Loans",
            description: "Loans due after more than one year",
            examples: ["Business loan (5 years)", "Equipment financing", "Long-term bank loan"],
            whenToUse: "When you borrow money for more than 12 months"
          },
          {
            code: "2600",
            name: "Mortgages Payable",
            description: "Property loans secured by real estate",
            examples: ["Office building mortgage", "Warehouse mortgage"],
            whenToUse: "When you have a mortgage on business property"
          },
          {
            code: "2700",
            name: "Lease Liabilities",
            description: "Long-term lease obligations",
            examples: ["Equipment lease", "Vehicle lease", "Property lease"],
            whenToUse: "When you lease equipment or property long-term"
          }
        ]
      }
    }
  },

  // EQUITY (3000-3999)
  equity: {
    title: "Equity - Owner's Stake in Business",
    description: "Equity represents the owner's investment and accumulated profits in the business. What's left after paying all debts.",
    categories: {
      ownerEquity: {
        title: "Owner's Equity (3000-3999)",
        description: "Owner's investment and business profits",
        accounts: [
          {
            code: "3000-3030",
            name: "Capital/Share Capital",
            description: "Money invested by owners/shareholders",
            examples: ["Initial business investment", "Additional capital injection", "Share purchases"],
            whenToUse: "When owners put money into the business"
          },
          {
            code: "3100",
            name: "Retained Earnings",
            description: "Accumulated profits kept in the business",
            examples: ["Previous years' profits", "Profits not distributed"],
            whenToUse: "At year-end to transfer net profit"
          },
          {
            code: "3200",
            name: "Current Year Profit/Loss",
            description: "This year's profit or loss",
            examples: ["Year-to-date profit", "Current period earnings"],
            whenToUse: "Automatically calculated from revenue minus expenses"
          },
          {
            code: "3300-3310",
            name: "Drawings/Dividends",
            description: "Money taken out by owners",
            examples: ["Owner withdrawals", "Dividend payments", "Personal use of business funds"],
            whenToUse: "When owners take money out of the business"
          }
        ]
      }
    }
  },

  // REVENUE (4000-4999)
  revenue: {
    title: "Revenue - Money Your Business Earns",
    description: "Revenue is income from your business activities. Money coming in from sales and services.",
    categories: {
      operatingRevenue: {
        title: "Operating Revenue (4000-4600)",
        description: "Income from main business activities",
        accounts: [
          {
            code: "4000-4020",
            name: "Sales Revenue",
            description: "Income from selling products",
            examples: ["Product sales", "Merchandise sold", "Retail sales", "Wholesale revenue"],
            whenToUse: "When you sell physical products"
          },
          {
            code: "4100-4120",
            name: "Service Revenue",
            description: "Income from providing services",
            examples: ["Consulting fees", "Professional services", "Repair services", "Maintenance contracts"],
            whenToUse: "When you provide services to customers"
          },
          {
            code: "4600",
            name: "Subscription Revenue",
            description: "Recurring income from subscriptions",
            examples: ["Monthly subscriptions", "Membership fees", "SaaS revenue"],
            whenToUse: "When customers pay recurring fees"
          }
        ]
      },
      otherIncome: {
        title: "Other Income (4200-4700)",
        description: "Income from non-primary activities",
        accounts: [
          {
            code: "4200",
            name: "Interest Income",
            description: "Income from bank interest or loans given",
            examples: ["Bank interest earned", "Interest on business savings"],
            whenToUse: "When your bank pays you interest"
          },
          {
            code: "4300",
            name: "Rental Income",
            description: "Income from renting out property/equipment",
            examples: ["Office space rental", "Equipment rental", "Property lease income"],
            whenToUse: "When you rent out assets"
          },
          {
            code: "4400-4500",
            name: "Commission/Royalty Income",
            description: "Income from commissions or royalties",
            examples: ["Sales commissions", "Referral fees", "Patent royalties", "Licensing fees"],
            whenToUse: "When you earn commissions or royalties"
          }
        ]
      },
      contraRevenue: {
        title: "Contra Revenue (4800-4810)",
        description: "Reductions to revenue (negative revenue)",
        accounts: [
          {
            code: "4800",
            name: "Sales Discounts",
            description: "Discounts given to customers",
            examples: ["Early payment discounts", "Volume discounts", "Promotional discounts"],
            whenToUse: "When you give discounts on sales"
          },
          {
            code: "4810",
            name: "Sales Returns & Allowances",
            description: "Products returned or price reductions",
            examples: ["Customer returns", "Refunds", "Price adjustments"],
            whenToUse: "When customers return products or get refunds"
          }
        ]
      }
    }
  },

  // COGS (5000-5999)
  cogs: {
    title: "Cost of Goods Sold - Direct Costs to Make/Buy Products",
    description: "COGS includes all direct costs to produce or purchase the products you sell. These costs directly relate to your products.",
    categories: {
      directCosts: {
        title: "Direct Costs (5000-5500)",
        description: "Costs directly tied to producing/buying products",
        accounts: [
          {
            code: "5000",
            name: "Cost of Goods Sold",
            description: "Total cost of products sold",
            examples: ["Cost of inventory sold", "Direct product costs"],
            whenToUse: "Automatically calculated: Opening Inventory + Purchases - Closing Inventory"
          },
          {
            code: "5100-5120",
            name: "Purchases",
            description: "Cost of buying products or materials",
            examples: ["Buying inventory to resell", "Raw materials purchased", "Merchandise bought from suppliers"],
            whenToUse: "When you buy products to resell or materials to manufacture"
          },
          {
            code: "5200-5220",
            name: "Direct Labor",
            description: "Wages for workers who make the products",
            examples: ["Factory workers", "Production staff", "Assembly line workers"],
            whenToUse: "When paying workers directly involved in production"
          },
          {
            code: "5300-5320",
            name: "Freight In",
            description: "Shipping costs to get products/materials to you",
            examples: ["Supplier shipping charges", "Import duties", "Inbound freight"],
            whenToUse: "When you pay to ship inventory to your business"
          },
          {
            code: "5400-5420",
            name: "Manufacturing Overhead",
            description: "Factory costs to make products",
            examples: ["Factory rent", "Factory utilities", "Factory supplies", "Production equipment"],
            whenToUse: "For costs in the factory/production area"
          }
        ]
      }
    }
  },

  // EXPENSES (6000-6999)
  expenses: {
    title: "Expenses - Costs to Run Your Business",
    description: "Expenses are costs to operate your business that aren't directly tied to making products. General business costs.",
    categories: {
      operatingExpenses: {
        title: "Operating Expenses (6000-6799)",
        description: "Regular costs to run the business",
        accounts: [
          {
            code: "6000-6020",
            name: "Rent Expense",
            description: "Cost of renting business space",
            examples: ["Office rent", "Warehouse rent", "Retail space rent"],
            whenToUse: "When you pay rent for business premises"
          },
          {
            code: "6100-6140",
            name: "Salaries & Wages",
            description: "Employee pay (not production workers)",
            examples: ["Office staff salaries", "Sales team pay", "Manager salaries", "Admin staff", "Benefits", "Payroll taxes"],
            whenToUse: "When paying non-production employees"
          },
          {
            code: "6200-6240",
            name: "Utilities",
            description: "Office utilities and services",
            examples: ["Electricity bill", "Water bill", "Internet", "Phone", "Gas"],
            whenToUse: "When paying utility bills for office/non-production areas"
          },
          {
            code: "6300-6320",
            name: "Office Supplies",
            description: "Supplies for office use",
            examples: ["Stationery", "Printer paper", "Pens", "Office equipment", "Postage"],
            whenToUse: "When buying office supplies"
          },
          {
            code: "6400-6430",
            name: "Marketing & Advertising",
            description: "Costs to promote your business",
            examples: ["Facebook ads", "Google ads", "Flyers", "Promotional materials", "Website marketing"],
            whenToUse: "When spending on advertising or marketing"
          },
          {
            code: "6500-6530",
            name: "Insurance",
            description: "Insurance premiums",
            examples: ["Business insurance", "Vehicle insurance", "Health insurance", "Liability insurance"],
            whenToUse: "When paying insurance premiums"
          },
          {
            code: "6600-6630",
            name: "Repairs & Maintenance",
            description: "Fixing and maintaining assets",
            examples: ["Building repairs", "Equipment maintenance", "Vehicle repairs", "Computer repairs"],
            whenToUse: "When paying for repairs or maintenance"
          },
          {
            code: "6700-6730",
            name: "Professional Fees",
            description: "Fees for professional services",
            examples: ["Lawyer fees", "Accountant fees", "Consultant fees", "Professional advice"],
            whenToUse: "When paying for professional services"
          },
          {
            code: "6930-6960",
            name: "Other Operating Expenses",
            description: "Other business costs",
            examples: ["Travel expenses", "Training", "Licenses", "Permits", "Subscriptions", "Memberships"],
            whenToUse: "For other regular business expenses"
          }
        ]
      },
      nonOperatingExpenses: {
        title: "Non-Operating Expenses (6800-6920)",
        description: "Costs not related to main operations",
        accounts: [
          {
            code: "6800-6830",
            name: "Interest & Bank Charges",
            description: "Cost of borrowing money and bank fees",
            examples: ["Loan interest", "Bank fees", "Credit card interest", "Overdraft charges"],
            whenToUse: "When paying interest on loans or bank charges"
          },
          {
            code: "6850-6860",
            name: "Tax Expenses",
            description: "Income and payroll tax expenses",
            examples: ["Corporate income tax", "Payroll tax expense"],
            whenToUse: "When recording tax obligations"
          },
          {
            code: "6900-6920",
            name: "Depreciation & Other",
            description: "Asset depreciation and other non-cash expenses",
            examples: ["Depreciation expense", "Amortization", "Bad debts written off"],
            whenToUse: "For depreciation and non-cash expenses"
          }
        ]
      }
    }
  },

  // OTHER INCOME/EXPENSES (7000-7999)
  other: {
    title: "Other Income/Expenses - Unusual or One-Time Items",
    description: "Income or expenses from unusual, non-recurring, or non-operating activities.",
    categories: {
      otherIncome: {
        title: "Other Income (7000-7499)",
        description: "Unusual or one-time income",
        accounts: [
          {
            code: "7100-7120",
            name: "Gains on Asset Sales",
            description: "Profit from selling business assets",
            examples: ["Sold old equipment for more than book value", "Profit on vehicle sale", "Investment gains"],
            whenToUse: "When you sell an asset for more than its value"
          },
          {
            code: "7200",
            name: "Foreign Exchange Gains",
            description: "Profit from currency exchange",
            examples: ["Currency exchange profit", "Forex gains"],
            whenToUse: "When currency exchange rates work in your favor"
          },
          {
            code: "7300-7400",
            name: "Other Unusual Income",
            description: "Other one-time income",
            examples: ["Insurance claim received", "Legal settlement won", "Miscellaneous income"],
            whenToUse: "For unusual or one-time income"
          }
        ]
      },
      otherExpenses: {
        title: "Other Expenses (7500-7999)",
        description: "Unusual or one-time expenses",
        accounts: [
          {
            code: "7600-7620",
            name: "Losses on Asset Sales",
            description: "Loss from selling business assets",
            examples: ["Sold equipment for less than book value", "Loss on vehicle sale", "Investment losses"],
            whenToUse: "When you sell an asset for less than its value"
          },
          {
            code: "7700",
            name: "Foreign Exchange Losses",
            description: "Loss from currency exchange",
            examples: ["Currency exchange loss", "Forex losses"],
            whenToUse: "When currency exchange rates work against you"
          },
          {
            code: "7800-7900",
            name: "Other Unusual Expenses",
            description: "Other one-time expenses",
            examples: ["Penalties", "Fines", "Legal settlements paid", "Miscellaneous expenses"],
            whenToUse: "For unusual or one-time expenses"
          }
        ]
      }
    }
  }
}

// Quick search function
export function searchAccountGuide(searchTerm) {
  const results = []
  const term = searchTerm.toLowerCase()

  Object.entries(ACCOUNT_GUIDE).forEach(([key, section]) => {
    Object.entries(section.categories || {}).forEach(([catKey, category]) => {
      category.accounts?.forEach(account => {
        const searchableText = `${account.code} ${account.name} ${account.description} ${account.examples.join(' ')} ${account.whenToUse}`.toLowerCase()
        if (searchableText.includes(term)) {
          results.push({
            ...account,
            section: section.title,
            category: category.title
          })
        }
      })
    })
  })

  return results
}

// Get account by code
export function getAccountInfo(code) {
  const codeNum = parseInt(code)
  
  for (const section of Object.values(ACCOUNT_GUIDE)) {
    for (const category of Object.values(section.categories || {})) {
      for (const account of category.accounts || []) {
        if (account.code === code || 
            (account.code.includes('-') && 
             codeNum >= parseInt(account.code.split('-')[0]) && 
             codeNum <= parseInt(account.code.split('-')[1]))) {
          return {
            ...account,
            section: section.title,
            category: category.title
          }
        }
      }
    }
  }
  
  return null
}
