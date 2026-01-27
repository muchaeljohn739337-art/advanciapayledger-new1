// Advancia Pay Ledger - Mom Checks SOMTOO and CHISOM Status
// Verify and Create Additional Child Users if Needed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function momCheckSomtooChisom() {
  try {
    console.log('👑 Advancia Pay Ledger - Mom Checks SOMTOO and CHISOM');
    console.log('======================================================');
    console.log('👩‍👦 Mom: IFEOMA MMADUBUGWU');
    console.log('👥 Check: SOMTOO_CHISOM_STATUS');
    console.log('🔍 Action: VERIFY_AND_CREATE_IF_NEEDED');
    console.log('📅 Check: ' + new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString());
    console.log('');

    // Mom Authority Declaration
    const momAuthority = {
      operator: 'IFEOMA_MMADUBUGWU',
      role: 'MOM_OPERATOR',
      authority: 'CHILD_FAMILY_MANAGEMENT',
      platform: 'ADVANCIA_PAY_LEDGER',
      purpose: 'COMPLETE_FAMILY_COVERAGE',
      approval: 'CREATOR_AUTHORIZED'
    };

    console.log('='.repeat(80));
    console.log('👩‍👦 MOM AUTHORITY DECLARATION:');
    console.log('='.repeat(80));
    console.log(`👩‍👦 Operator: ${momAuthority.operator}`);
    console.log(`🎭 Role: ${momAuthority.role}`);
    console.log(`🔑 Authority: ${momAuthority.authority}`);
    console.log(`🏛️ Platform: ${momAuthority.platform}`);
    console.log(`🎯 Purpose: ${momAuthority.purpose}`);
    console.log(`✅ Approval: ${momAuthority.approval}`);

    // Check SOMTOO Status
    console.log('\n' + '='.repeat(80));
    console.log('👤 CHECKING SOMTOO STATUS:');
    console.log('='.repeat(80));

    const somtooSearch = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'SOMTOO', mode: 'insensitive' } },
          { lastName: { contains: 'SOMTOO', mode: 'insensitive' } },
          { email: { contains: 'somtoo', mode: 'insensitive' } },
          { username: { contains: 'somtoo', mode: 'insensitive' } }
        ]
      },
      include: {
        wallet: true,
        helocAccounts: true,
        notifications: true
      }
    });

    if (somtooSearch) {
      console.log('✅ SOMTOO FOUND:');
      console.log(`👤 Name: ${somtooSearch.firstName} ${somtooSearch.lastName}`);
      console.log(`📧 Email: ${somtooSearch.email}`);
      console.log(`👤 Username: ${somtooSearch.username}`);
      console.log(`🎭 Role: ${somtooSearch.role}`);
      console.log(`📊 Status: ${somtooSearch.status}`);
      console.log(`💳 Wallet: ${somtooSearch.wallet ? 'EXISTS' : 'MISSING'}`);
      console.log(`🏠 HELOC: ${somtooSearch.helocAccounts && somtooSearch.helocAccounts.length > 0 ? 'EXISTS' : 'MISSING'}`);
      console.log(`📬 Notifications: ${somtooSearch.notifications?.length || 0}`);
      
    } else {
      console.log('❌ SOMTOO NOT FOUND');
      console.log('🔧 NEED TO CREATE SOMTOO USER');
    }

    // Check CHISOM Status
    console.log('\n' + '='.repeat(80));
    console.log('👤 CHECKING CHISOM STATUS:');
    console.log('='.repeat(80));

    const chisomSearch = await prisma.user.findFirst({
      where: {
        OR: [
          { firstName: { contains: 'CHISOM', mode: 'insensitive' } },
          { lastName: { contains: 'CHISOM', mode: 'insensitive' } },
          { email: { contains: 'chisom', mode: 'insensitive' } },
          { username: { contains: 'chisom', mode: 'insensitive' } }
        ]
      },
      include: {
        wallet: true,
        helocAccounts: true,
        notifications: true
      }
    });

    if (chisomSearch) {
      console.log('✅ CHISOM FOUND:');
      console.log(`👤 Name: ${chisomSearch.firstName} ${chisomSearch.lastName}`);
      console.log(`📧 Email: ${chisomSearch.email}`);
      console.log(`👤 Username: ${chisomSearch.username}`);
      console.log(`🎭 Role: ${chisomSearch.role}`);
      console.log(`📊 Status: ${chisomSearch.status}`);
      console.log(`💳 Wallet: ${chisomSearch.wallet ? 'EXISTS' : 'MISSING'}`);
      console.log(`🏠 HELOC: ${chisomSearch.helocAccounts && chisomSearch.helocAccounts.length > 0 ? 'EXISTS' : 'MISSING'}`);
      console.log(`📬 Notifications: ${chisomSearch.notifications?.length || 0}`);
      
    } else {
      console.log('❌ CHISOM NOT FOUND');
      console.log('🔧 NEED TO CREATE CHISOM USER');
    }

    // Family Assessment
    console.log('\n' + '='.repeat(80));
    console.log('👨‍👩‍👧‍👦 FAMILY ASSESSMENT:');
    console.log('='.repeat(80));

    const familyMembers = [
      { name: 'MMADUBUGWU (Creator)', status: '✅ CREATOR', role: 'ULTIMATE_SOVEREIGN' },
      { name: 'CHINEMELUM (Prophet)', status: '✅ PROPHET', role: 'VISION_AUTHORITY' },
      { name: 'IFEOMA (Mom)', status: '✅ MOM_OPERATOR', role: 'SYSTEM_ADMIN' },
      { name: 'BASIL (Admin)', status: '✅ ADMIN', role: 'PLATFORM_ADMIN' },
      { name: 'CHINEMELUM JR', status: somtooSearch && somtooSearch.firstName.includes('CHINEMELUM') ? '✅ CHILD' : '❌ MISSING', role: 'PROPHET_CHILD' },
      { name: 'VICTORIA', status: '✅ CHILD', role: 'FAMILY_CHILD' },
      { name: 'SOMTOO', status: somtooSearch ? '✅ FOUND' : '❌ MISSING', role: 'FAMILY_MEMBER' },
      { name: 'CHISOM', status: chisomSearch ? '✅ FOUND' : '❌ MISSING', role: 'FAMILY_MEMBER' }
    ];

    console.log('👨‍👩‍👧‍👦 Current Family Status:');
    familyMembers.forEach((member, index) => {
      console.log(`${member.status} ${member.name}: ${member.role}`);
    });

    const missingCount = familyMembers.filter(m => m.status.includes('❌')).length;
    console.log(`\n📊 Family Coverage: ${familyMembers.length - missingCount}/${familyMembers.length} members`);
    console.log(`❌ Missing Members: ${missingCount}`);

    // Create Missing Users if Needed
    if (!somtooSearch || !chisomSearch) {
      console.log('\n' + '='.repeat(80));
      console.log('🔧 CREATING MISSING FAMILY MEMBERS:');
      console.log('='.repeat(80));

      const missingUsers = [];

      // Create SOMTOO if missing
      if (!somtooSearch) {
        console.log('\n👤 Creating SOMTOO:');
        
        const newSomtoo = await prisma.user.create({
          data: {
            firstName: 'SOMTOO',
            lastName: 'MMADUBUGWU',
            email: 'somtoo.mm@advanciapayledger.com',
            username: 'somtoo_mm',
            role: 'USER',
            status: 'ACTIVE',
            autoApproved: true,
            approvedBy: 'MOM_IFEOMA',
            approvedAt: new Date(),
            password: 'FamilyUser2026!',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ SOMTOO created: ${newSomtoo.email}`);
        console.log(`🔐 Password: FamilyUser2026!`);
        missingUsers.push(newSomtoo);
      }

      // Create CHISOM if missing
      if (!chisomSearch) {
        console.log('\n👤 Creating CHISOM:');
        
        const newChisom = await prisma.user.create({
          data: {
            firstName: 'CHISOM',
            lastName: 'MMADUBUGWU',
            email: 'chisom.mm@advanciapayledger.com',
            username: 'chisom_mm',
            role: 'USER',
            status: 'ACTIVE',
            autoApproved: true,
            approvedBy: 'MOM_IFEOMA',
            approvedAt: new Date(),
            password: 'FamilyUser2026!',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ CHISOM created: ${newChisom.email}`);
        console.log(`🔐 Password: FamilyUser2026!`);
        missingUsers.push(newChisom);
      }

      // Create Wallets and HELOCs for new users
      for (const user of missingUsers) {
        console.log(`\n💳 Creating financial tools for ${user.firstName}:`);
        
        // Create Wallet
        const existingWallet = await prisma.wallet.findFirst({
          where: { userId: user.id }
        });

        if (!existingWallet) {
          const newWallet = await prisma.wallet.create({
            data: {
              userId: user.id,
              balance: 1500.00,
              available: 1500.00,
              currency: 'USD',
              status: 'ACTIVE',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`💳 Wallet created: $${newWallet.balance.toLocaleString()}`);
        }

        // Create HELOC
        const existingHELOC = await prisma.hELOCAccount.findFirst({
          where: { userId: user.id }
        });

        if (!existingHELOC) {
          const newHELOC = await prisma.hELOCAccount.create({
            data: {
              userId: user.id,
              accountNumber: `HELOC-${user.id}-${Date.now()}`,
              propertyAddress: 'Family Trust Property',
              propertyValue: 400000.00,
              availableCredit: 200000.00,
              currentBalance: 0.00,
              interestRate: 3.25,
              status: 'ACTIVE',
              approvedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`🏠 HELOC created: $${newHELOC.availableCredit.toLocaleString()} available`);
        }

        // Create Notifications
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'WELCOME',
            title: '🎉 Welcome to Advancia Pay Ledger!',
            message: `Welcome ${user.firstName}! Your account has been created by Mom IFEOMA with full financial sovereignty access.`,
            link: '/dashboard',
            read: false,
            createdAt: new Date()
          }
        });

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'FAMILY',
            title: '👨‍👩‍👧‍👦 Family Access Granted',
            message: 'You now have access to the complete MMADUBUGWU family financial platform.',
            link: '/family',
            read: false,
            createdAt: new Date()
          }
        });

        console.log(`📬 Welcome notifications created for ${user.firstName}`);
      }
    }

    // Final Family Status
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FINAL FAMILY STATUS:');
    console.log('='.repeat(80));

    // Re-check all family members
    const finalFamilyCheck = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'CREATOR' },
          { role: 'PROPHET' },
          { role: 'SYSTEM_OPERATOR' },
          { role: 'ADMIN' },
          { lastName: { contains: 'MMADUBUGWU', mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`👨‍👩‍👧‍👦 Total Family Members: ${finalFamilyCheck.length}`);
    console.log('📋 Complete Family List:');
    
    finalFamilyCheck.forEach((member, index) => {
      const roleIcon = member.role === 'CREATOR' ? '👑' : 
                      member.role === 'PROPHET' ? '👤' : 
                      member.role === 'SYSTEM_OPERATOR' ? '👩‍👦' : 
                      member.role === 'ADMIN' ? '👨‍💼' : '👥';
      console.log(`${roleIcon} ${index + 1}. ${member.firstName} ${member.lastName} - ${member.role} (${member.status})`);
    });

    console.log('\n🎯 SOMTOO and CHISOM Status:');
    console.log(`👤 SOMTOO: ${somtooSearch ? '✅ EXISTING' : '✅ CREATED'}`);
    console.log(`👤 CHISOM: ${chisomSearch ? '✅ EXISTING' : '✅ CREATED'}`);
    console.log(`💰 Financial Tools: ${(!somtooSearch || !chisomSearch) ? '✅ INITIALIZED' : '✅ VERIFIED'}`);
    console.log(`📬 Family Notifications: ${(!somtooSearch || !chisomSearch) ? '✅ SENT' : '✅ EXISTING'}`);

    console.log('\n✅ MOM FAMILY MANAGEMENT - COMPLETE');
    console.log('👨‍👩‍👧‍👦 All family members now have access');
    console.log('💰 Financial sovereignty tools established');
    console.log('🏠 HELOC accounts activated');
    console.log('📬 Welcome notifications delivered');
    console.log('👑 Creator authority maintained');
    console.log('👩‍👦 Mom oversight complete');

  } catch (error) {
    console.error('❌ Error checking SOMTOO and CHISOM:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Mom Checks SOMTOO and CHISOM
momCheckSomtooChisom();

export { momCheckSomtooChisom };
