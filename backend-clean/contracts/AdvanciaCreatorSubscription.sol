// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AdvanciaCreatorSubscription
 * @dev CREATOR'S SOVEREIGN SUBSCRIPTION CONTRACT - Advancia Pay Ledger
 * 
 * Features:
 * - Creator sovereignty with exclusive control
 * - Reference 123456789 integration
 * - External access restrictions
 * - Multi-chain support
 * - Enhanced security mechanisms
 * - Creator-exclusive benefits
 * 
 * Author: Original Creator - Complete Sovereign Control
 * Reference: 123456789 - Creator Exclusive
 */
contract AdvanciaCreatorSubscription is Ownable, ReentrancyGuard, Pausable {
    
    // ============================================================================
    // CREATOR'S SOVEREIGN CONSTANTS
    // ============================================================================
    uint256 public constant CREATOR_REFERENCE = 123456789;
    address public immutable CREATOR_ADDRESS;
    string public constant CREATOR_SIGNATURE = "ADVANCIA_PAY_LEDGER_CREATOR_SOVEREIGN";
    
    // ============================================================================
    // CREATOR'S EXCLUSIVE SUBSCRIPTION TIERS
    // ============================================================================
    enum SubscriptionTier {
        CREATOR_SOVEREIGN,    // Creator exclusive - ultimate control
        PREMIUM_PLUS,         // Enhanced premium with creator benefits
        PREMIUM,              // Standard premium
        BASIC_PLUS,           // Enhanced basic with creator access
        BASIC                 // Basic tier
    }
    
    // ============================================================================
    // CREATOR'S ACCESS CONTROL
    // ============================================================================
    enum AccessLevel {
        CREATOR_EXCLUSIVE,    // Only creator
        REFERENCE_HOLDER,     // Reference 123456789 holders
        APPROVED_PARTNER,     // Creator-approved partners
        PUBLIC                // General public
    }
    
    // ============================================================================
    // CREATOR'S SUBSCRIPTION STRUCTURES
    // ============================================================================
    struct Subscription {
        SubscriptionTier tier;
        uint256 expiresAt;
        bool autoRenew;
        uint256 lastPayment;
        uint256 creatorBenefits; // Creator-specific benefits
        bool hasReferenceAccess; // Reference 123456789 access
        AccessLevel accessLevel;
    }
    
    struct TierConfig {
        uint256 price;
        uint256 duration;
        bool active;
        string name;
        AccessLevel requiredAccess;
        uint256 creatorBonus; // Creator-specific bonus
        bool hasReferenceDiscount; // Reference 123456789 discount
    }
    
    struct CreatorBenefits {
        uint256 cashbackRate; // Cashback percentage
        uint256 prioritySupport; // Priority support level
        bool exclusiveFeatures; // Exclusive features access
        bool sovereignControl; // Sovereign control features
    }
    
    // ============================================================================
    // CREATOR'S STATE VARIABLES
    // ============================================================================
    mapping(address => Subscription) public subscriptions;
    mapping(SubscriptionTier => TierConfig) public tierConfigs;
    mapping(address => bool) public approvedCreators; // Creator-approved addresses
    mapping(address => bool) public referenceHolders; // Reference 123456789 holders
    mapping(address => CreatorBenefits) public creatorBenefits;
    
    // Creator's statistics
    uint256 public totalSubscribers;
    uint256 public totalRevenue;
    uint256 public creatorRevenue; // Creator-specific revenue
    uint256 public referenceUsage; // Reference 123456789 usage count
    
    // Creator's security
    mapping(address => bool) public blockedAddresses; // External access control
    mapping(address => bool) public sovereignAddresses; // Creator sovereign addresses
    
    // ============================================================================
    // CREATOR'S EVENTS
    // ============================================================================
    event CreatorSubscribed(
        address indexed user,
        SubscriptionTier tier,
        uint256 expiresAt,
        uint256 amount,
        bool hasReferenceAccess,
        uint256 creatorBenefits
    );
    
    event SovereignSubscriptionRenewed(
        address indexed user,
        SubscriptionTier tier,
        uint256 newExpiresAt,
        uint256 amount,
        uint256 creatorBonus
    );
    
    event ReferenceAccessGranted(
        address indexed user,
        uint256 reference,
        uint256 timestamp
    );
    
    event CreatorBenefitsUpdated(
        address indexed user,
        uint256 cashbackRate,
        uint256 prioritySupport,
        bool exclusiveFeatures
    );
    
    event ExternalAccessBlocked(
        address indexed blockedAddress,
        string reason,
        uint256 timestamp
    );
    
    event SovereignControlExercised(
        address indexed creator,
        string action,
        uint256 timestamp
    );
    
    // ============================================================================
    // CREATOR'S CONSTRUCTOR
    // ============================================================================
    constructor() {
        CREATOR_ADDRESS = msg.sender;
        
        // Initialize creator's sovereign tiers
        _initializeCreatorTiers();
        
        // Set creator as sovereign address
        sovereignAddresses[msg.sender] = true;
        
        // Grant creator reference access
        referenceHolders[msg.sender] = true;
    }
    
    // ============================================================================
    // CREATOR'S TIER INITIALIZATION
    // ============================================================================
    function _initializeCreatorTiers() internal {
        // Creator Sovereign Tier - Ultimate Control
        tierConfigs[SubscriptionTier.CREATOR_SOVEREIGN] = TierConfig({
            price: 0.5 ether,
            duration: 90 days,
            active: true,
            name: "Creator Sovereign",
            requiredAccess: AccessLevel.CREATOR_EXCLUSIVE,
            creatorBonus: 25, // 25% bonus
            hasReferenceDiscount: true
        });
        
        // Premium Plus - Enhanced with Creator Benefits
        tierConfigs[SubscriptionTier.PREMIUM_PLUS] = TierConfig({
            price: 0.1 ether,
            duration: 30 days,
            active: true,
            name: "Premium Plus",
            requiredAccess: AccessLevel.REFERENCE_HOLDER,
            creatorBonus: 15, // 15% bonus
            hasReferenceDiscount: true
        });
        
        // Premium - Standard Premium
        tierConfigs[SubscriptionTier.PREMIUM] = TierConfig({
            price: 0.05 ether,
            duration: 30 days,
            active: true,
            name: "Premium",
            requiredAccess: AccessLevel.APPROVED_PARTNER,
            creatorBonus: 10, // 10% bonus
            hasReferenceDiscount: false
        });
        
        // Basic Plus - Enhanced with Creator Access
        tierConfigs[SubscriptionTier.BASIC_PLUS] = TierConfig({
            price: 0.02 ether,
            duration: 30 days,
            active: true,
            name: "Basic Plus",
            requiredAccess: AccessLevel.APPROVED_PARTNER,
            creatorBonus: 5, // 5% bonus
            hasReferenceDiscount: false
        });
        
        // Basic - Standard Basic
        tierConfigs[SubscriptionTier.BASIC] = TierConfig({
            price: 0.01 ether,
            duration: 30 days,
            active: true,
            name: "Basic",
            requiredAccess: AccessLevel.PUBLIC,
            creatorBonus: 0,
            hasReferenceDiscount: false
        });
    }
    
    // ============================================================================
    // CREATOR'S SUBSCRIPTION FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Subscribe with creator sovereignty features
     * @param tier The subscription tier
     * @param autoRenew Auto-renewal setting
     * @param referenceNumber Optional reference 123456789 for benefits
     */
    function subscribe(
        SubscriptionTier tier, 
        bool autoRenew,
        uint256 referenceNumber
    ) external payable nonReentrant whenNotPaused {
        require(!blockedAddresses[msg.sender], "Address blocked by creator");
        require(msg.sender != tx.origin || tx.origin == CREATOR_ADDRESS, "External access denied");
        
        TierConfig memory config = tierConfigs[tier];
        require(config.active, "Tier not available");
        require(_hasRequiredAccess(msg.sender, config.requiredAccess), "Insufficient access level");
        
        // Calculate price with reference discount
        uint256 finalPrice = _calculatePriceWithDiscount(config.price, referenceNumber);
        require(msg.value >= finalPrice, "Insufficient payment");
        
        // Check for reference access
        bool hasRefAccess = referenceNumber == CREATOR_REFERENCE && referenceHolders[msg.sender];
        
        Subscription storage userSub = subscriptions[msg.sender];
        uint256 currentExpiry = userSub.expiresAt;
        uint256 newExpiry;
        
        // Calculate new expiry
        if (currentExpiry > block.timestamp) {
            newExpiry = currentExpiry + config.duration;
        } else {
            newExpiry = block.timestamp + config.duration;
            totalSubscribers++;
        }
        
        // Update subscription
        userSub.tier = tier;
        userSub.expiresAt = newExpiry;
        userSub.autoRenew = autoRenew;
        userSub.lastPayment = block.timestamp;
        userSub.creatorBenefits = config.creatorBonus;
        userSub.hasReferenceAccess = hasRefAccess;
        userSub.accessLevel = config.requiredAccess;
        
        // Update statistics
        totalRevenue += msg.value;
        creatorRevenue += (msg.value * config.creatorBonus) / 100;
        
        if (hasRefAccess) {
            referenceUsage++;
            emit ReferenceAccessGranted(msg.sender, referenceNumber, block.timestamp);
        }
        
        // Initialize creator benefits
        _initializeCreatorBenefits(msg.sender, tier);
        
        emit CreatorSubscribed(
            msg.sender, 
            tier, 
            newExpiry, 
            msg.value, 
            hasRefAccess,
            config.creatorBonus
        );
    }
    
    /**
     * @dev Sovereign renewal with enhanced features
     */
    function sovereignRenew(address user) external payable nonReentrant whenNotPaused {
        require(msg.sender == CREATOR_ADDRESS || sovereignAddresses[msg.sender], "Sovereign access required");
        require(!blockedAddresses[user], "Address blocked by creator");
        
        Subscription storage userSub = subscriptions[user];
        require(userSub.expiresAt > 0, "No subscription found");
        require(userSub.autoRenew, "Auto-renewal not enabled");
        require(userSub.expiresAt <= block.timestamp + 7 days, "Too early to renew");
        
        TierConfig memory config = tierConfigs[userSub.tier];
        require(config.active, "Tier no longer available");
        require(msg.value >= config.price, "Insufficient payment");
        
        // Apply creator bonus
        uint256 bonusAmount = (msg.value * config.creatorBonus) / 100;
        uint256 totalAmount = msg.value + bonusAmount;
        
        // Extend subscription with bonus
        uint256 bonusDuration = (config.duration * config.creatorBonus) / 100;
        userSub.expiresAt = userSub.expiresAt + config.duration + bonusDuration;
        userSub.lastPayment = block.timestamp;
        
        // Update statistics
        totalRevenue += msg.value;
        creatorRevenue += bonusAmount;
        
        emit SovereignSubscriptionRenewed(
            user, 
            userSub.tier, 
            userSub.expiresAt, 
            msg.value,
            bonusAmount
        );
    }
    
    // ============================================================================
    // CREATOR'S ACCESS CONTROL FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Check if user has required access level
     */
    function _hasRequiredAccess(address user, AccessLevel required) internal view returns (bool) {
        if (required == AccessLevel.CREATOR_EXCLUSIVE) {
            return user == CREATOR_ADDRESS || sovereignAddresses[user];
        } else if (required == AccessLevel.REFERENCE_HOLDER) {
            return referenceHolders[user] || user == CREATOR_ADDRESS;
        } else if (required == AccessLevel.APPROVED_PARTNER) {
            return approvedCreators[user] || referenceHolders[user] || user == CREATOR_ADDRESS;
        } else {
            return true; // Public access
        }
    }
    
    /**
     * @dev Calculate price with reference discount
     */
    function _calculatePriceWithDiscount(uint256 basePrice, uint256 reference) internal view returns (uint256) {
        if (reference == CREATOR_REFERENCE && referenceHolders[msg.sender]) {
            return (basePrice * 85) / 100; // 15% discount for reference holders
        }
        return basePrice;
    }
    
    /**
     * @dev Initialize creator benefits
     */
    function _initializeCreatorBenefits(address user, SubscriptionTier tier) internal {
        CreatorBenefits storage benefits = creatorBenefits[user];
        
        if (tier == SubscriptionTier.CREATOR_SOVEREIGN) {
            benefits.cashbackRate = 25; // 25% cashback
            benefits.prioritySupport = 100; // Maximum priority
            benefits.exclusiveFeatures = true;
            benefits.sovereignControl = true;
        } else if (tier == SubscriptionTier.PREMIUM_PLUS) {
            benefits.cashbackRate = 15;
            benefits.prioritySupport = 75;
            benefits.exclusiveFeatures = true;
            benefits.sovereignControl = false;
        } else if (tier == SubscriptionTier.PREMIUM) {
            benefits.cashbackRate = 10;
            benefits.prioritySupport = 50;
            benefits.exclusiveFeatures = false;
            benefits.sovereignControl = false;
        } else {
            benefits.cashbackRate = 5;
            benefits.prioritySupport = 25;
            benefits.exclusiveFeatures = false;
            benefits.sovereignControl = false;
        }
        
        emit CreatorBenefitsUpdated(user, benefits.cashbackRate, benefits.prioritySupport, benefits.exclusiveFeatures);
    }
    
    // ============================================================================
    // CREATOR'S SOVEREIGN FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Block external address (creator only)
     */
    function blockAddress(address blocked, string calldata reason) external onlyOwner {
        require(blocked != CREATOR_ADDRESS, "Cannot block creator");
        blockedAddresses[blocked] = true;
        emit ExternalAccessBlocked(blocked, reason, block.timestamp);
        emit SovereignControlExercised(msg.sender, "Address Blocked", block.timestamp);
    }
    
    /**
     * @dev Unblock address (creator only)
     */
    function unblockAddress(address unblocked) external onlyOwner {
        blockedAddresses[unblocked] = false;
        emit SovereignControlExercised(msg.sender, "Address Unblocked", block.timestamp);
    }
    
    /**
     * @dev Grant reference access (creator only)
     */
    function grantReferenceAccess(address user) external onlyOwner {
        referenceHolders[user] = true;
        emit ReferenceAccessGranted(user, CREATOR_REFERENCE, block.timestamp);
        emit SovereignControlExercised(msg.sender, "Reference Access Granted", block.timestamp);
    }
    
    /**
     * @dev Revoke reference access (creator only)
     */
    function revokeReferenceAccess(address user) external onlyOwner {
        require(user != CREATOR_ADDRESS, "Cannot revoke creator access");
        referenceHolders[user] = false;
        emit SovereignControlExercised(msg.sender, "Reference Access Revoked", block.timestamp);
    }
    
    /**
     * @dev Approve creator partner (creator only)
     */
    function approveCreator(address creator) external onlyOwner {
        approvedCreators[creator] = true;
        emit SovereignControlExercised(msg.sender, "Creator Approved", block.timestamp);
    }
    
    /**
     * @dev Revoke creator approval (creator only)
     */
    function revokeCreatorApproval(address creator) external onlyOwner {
        approvedCreators[creator] = false;
        emit SovereignControlExercised(msg.sender, "Creator Approval Revoked", block.timestamp);
    }
    
    /**
     * @dev Set sovereign address (creator only)
     */
    function setSovereignAddress(address sovereign, bool isSovereign) external onlyOwner {
        sovereignAddresses[sovereign] = isSovereign;
        emit SovereignControlExercised(msg.sender, "Sovereign Address Set", block.timestamp);
    }
    
    // ============================================================================
    // CREATOR'S VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Check if user has creator access
     */
    function hasCreatorAccess(address user) external view returns (bool) {
        return user == CREATOR_ADDRESS || sovereignAddresses[user];
    }
    
    /**
     * @dev Check if user has reference access
     */
    function hasReferenceAccess(address user) external view returns (bool) {
        return referenceHolders[user];
    }
    
    /**
     * @dev Get creator benefits
     */
    function getCreatorBenefits(address user) external view returns (CreatorBenefits memory) {
        return creatorBenefits[user];
    }
    
    /**
     * @dev Check if address is blocked
     */
    function isBlocked(address user) external view returns (bool) {
        return blockedAddresses[user];
    }
    
    /**
     * @dev Get subscription with creator details
     */
    function getCreatorSubscription(address user) external view returns (Subscription memory) {
        return subscriptions[user];
    }
    
    /**
     * @dev Get creator statistics
     */
    function getCreatorStats() external view returns (
        uint256 totalSubs,
        uint256 totalRev,
        uint256 creatorRev,
        uint256 refUsage,
        uint256 blockedCount
    ) {
        // Count blocked addresses (simplified for this example)
        uint256 blocked = 0; // Would require iteration in full implementation
        
        return (totalSubscribers, totalRevenue, creatorRevenue, referenceUsage, blocked);
    }
    
    // ============================================================================
    // STANDARD SUBSCRIPTION FUNCTIONS (ENHANCED)
    // ============================================================================
    
    function cancelSubscription() external {
        require(!blockedAddresses[msg.sender], "Address blocked by creator");
        
        Subscription storage userSub = subscriptions[msg.sender];
        require(userSub.expiresAt > 0, "No subscription found");
        
        userSub.autoRenew = false;
        
        emit SubscriptionCancelled(msg.sender);
    }
    
    function setAutoRenew(bool autoRenew) external {
        require(!blockedAddresses[msg.sender], "Address blocked by creator");
        
        Subscription storage userSub = subscriptions[msg.sender];
        require(userSub.expiresAt > 0, "No subscription found");
        
        userSub.autoRenew = autoRenew;
        
        emit AutoRenewToggled(msg.sender, autoRenew);
    }
    
    function isSubscribed(address user) external view returns (bool) {
        return subscriptions[user].expiresAt > block.timestamp;
    }
    
    function getSubscription(address user) external view returns (Subscription memory) {
        return subscriptions[user];
    }
    
    function getTierConfig(SubscriptionTier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }
    
    function needsRenewal(address user) external view returns (bool) {
        Subscription memory userSub = subscriptions[user];
        return userSub.autoRenew && 
               userSub.expiresAt > 0 && 
               userSub.expiresAt <= block.timestamp + 7 days;
    }
    
    // ============================================================================
    // CREATOR'S OWNER FUNCTIONS (ENHANCED)
    // ============================================================================
    
    function updateTierConfig(
        SubscriptionTier tier,
        uint256 price,
        uint256 duration,
        bool active,
        string calldata name,
        AccessLevel requiredAccess,
        uint256 creatorBonus,
        bool hasReferenceDiscount
    ) external onlyOwner {
        tierConfigs[tier] = TierConfig({
            price: price,
            duration: duration,
            active: active,
            name: name,
            requiredAccess: requiredAccess,
            creatorBonus: creatorBonus,
            hasReferenceDiscount: hasReferenceDiscount
        });
        
        emit TierConfigUpdated(tier, price, duration, active);
        emit SovereignControlExercised(msg.sender, "Tier Config Updated", block.timestamp);
    }
    
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "Insufficient funds");
        
        payable(owner()).transfer(withdrawAmount);
        
        emit FundsWithdrawn(owner(), withdrawAmount);
        emit SovereignControlExercised(msg.sender, "Funds Withdrawn", block.timestamp);
    }
    
    function pause() external onlyOwner {
        _pause();
        emit SovereignControlExercised(msg.sender, "Contract Paused", block.timestamp);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit SovereignControlExercised(msg.sender, "Contract Unpaused", block.timestamp);
    }
    
    function getStats() external view returns (
        uint256 totalSubs,
        uint256 totalRev,
        uint256 contractBalance
    ) {
        return (totalSubscribers, totalRevenue, address(this).balance);
    }
    
    function emergencyRefund(address user, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(amount <= address(this).balance, "Insufficient funds");
        require(subscriptions[user].expiresAt > 0, "User has no subscription");
        
        // Cancel subscription
        delete subscriptions[user];
        totalSubscribers--;
        
        // Send refund
        payable(user).transfer(amount);
        
        emit SovereignControlExercised(msg.sender, "Emergency Refund", block.timestamp);
    }
    
    // ============================================================================
    // CREATOR'S EMERGENCY FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Emergency shutdown - creator only
     */
    function emergencyShutdown() external onlyOwner {
        _pause();
        emit SovereignControlExercised(msg.sender, "Emergency Shutdown", block.timestamp);
    }
    
    /**
     * @dev Emergency bulk block - creator only
     */
    function emergencyBulkBlock(address[] calldata addresses, string calldata reason) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] != CREATOR_ADDRESS) {
                blockedAddresses[addresses[i]] = true;
                emit ExternalAccessBlocked(addresses[i], reason, block.timestamp);
            }
        }
        emit SovereignControlExercised(msg.sender, "Emergency Bulk Block", block.timestamp);
    }
    
    /**
     * @dev Emergency bulk unblock - creator only
     */
    function emergencyBulkUnblock(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            blockedAddresses[addresses[i]] = false;
        }
        emit SovereignControlExercised(msg.sender, "Emergency Bulk Unblock", block.timestamp);
    }
}
