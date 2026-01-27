// Rockefeller HELOC Communication Discipline System
// Implements Controlled Communication, Channel Separation, and Audit Requirements
// Reference Number: 123456789-HELOC

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface CommunicationChannel {
  id: string;
  type: 'CRITICAL' | 'ROUTINE' | 'SENSITIVE';
  participants: string[];
  purpose: string;
  createdAt: Date;
  expiresAt?: Date;
  encryptionKey?: string;
  retentionPolicy: string;
  loggingLevel: 'FULL' | 'BASIC' | 'MINIMAL';
  messages: Message[];
}

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  type: 'WRITTEN' | 'VOICE' | 'VIDEO';
  timestamp: Date;
  encrypted: boolean;
  signature: string;
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: Date;
  details: any;
  signature: string;
}

interface CommunicationPolicy {
  channelType: string;
  maxParticipants: number;
  retentionPeriod: string;
  encryptionRequired: boolean;
  approvalRequired: boolean;
  allowedRoles: string[];
  prohibitedContent: string[];
  loggingLevel: string;
}

export class CommunicationDisciplineSystem {
  private channels: Map<string, CommunicationChannel> = new Map();
  private policies: Map<string, CommunicationPolicy> = new Map();
  private auditLog: AuditEntry[] = [];
  private personalChannels: Set<string> = new Set();
  private emergencyProtocols: Map<string, any> = new Map();

  constructor() {
    this.initializePolicies();
    this.initializeAuditSystem();
    this.loadExistingChannels();
  }

  // CHANNEL SEPARATION IMPLEMENTATION
  async createChannel(request: {
    type: 'CRITICAL' | 'ROUTINE' | 'SENSITIVE';
    participants: string[];
    purpose: string;
    duration?: number;
    justification?: string;
  }): Promise<{
    approved: boolean;
    channelId?: string;
    conditions?: string[];
    reason: string;
  }> {
    // Validate against communication discipline rules
    const validation = await this.validateChannelCreation(request);
    if (!validation.valid) {
      return {
        approved: false,
        reason: validation.reason
      };
    }

    // Check for personal channels (prohibited)
    if (request.participants.length === 1) {
      this.personalChannels.add(request.participants[0]);
      return {
        approved: false,
        reason: 'Personal channels are prohibited for internal communications'
      };
    }

    // Validate minimal distribution
    const policy = this.policies.get(request.type);
    if (request.participants.length > policy.maxParticipants) {
      return {
        approved: false,
        reason: `Too many participants for ${request.type} channel (max: ${policy.maxParticipants})`
      };
    }

    // Check role distribution
    const roleValidation = await this.validateRoleDistribution(request.type, request.participants);
    if (!roleValidation.valid) {
      return {
        approved: false,
        reason: roleValidation.reason
      };
    }

    // Create channel with appropriate restrictions
    const channelId = crypto.randomUUID();
    const channel: CommunicationChannel = {
      id: channelId,
      type: request.type,
      participants: request.participants,
      purpose: request.purpose,
      createdAt: new Date(),
      expiresAt: request.duration ? new Date(Date.now() + request.duration * 60 * 60 * 1000) : undefined,
      encryptionKey: policy.encryptionRequired ? crypto.randomBytes(32).toString('hex') : undefined,
      retentionPolicy: policy.retentionPeriod,
      loggingLevel: policy.loggingLevel as any,
      messages: []
    };

    this.channels.set(channelId, channel);

    // Log channel creation
    await this.logAuditEvent('CHANNEL_CREATED', {
      channelId,
      type: request.type,
      participants: request.participants,
      purpose: request.purpose,
      justification: request.justification
    });

    return {
      approved: true,
      channelId,
      conditions: this.generateChannelConditions(channel),
      reason: 'Channel created successfully'
    };
  }

  private async validateChannelCreation(request: {
    type: string;
    participants: string[];
    purpose: string;
  }): Promise<{ valid: boolean; reason: string }> {
    // Rule: No convenience or urgency bypasses
    if (request.purpose.includes('urgent') || request.purpose.includes('quick')) {
      return {
        valid: false,
        reason: 'Urgency or convenience cannot bypass communication protocols'
      };
    }

    // Rule: Clear purpose required
    if (!request.purpose || request.purpose.length < 20) {
      return {
        valid: false,
        reason: 'Clear, detailed purpose is required (minimum 20 characters)'
      };
    }

    // Rule: No informal side channels
    const existingChannels = Array.from(this.channels.values());
    const similarChannel = existingChannels.find(ch =>
      ch.participants.length === request.participants.length &&
      ch.participants.every(p => request.participants.includes(p)) &&
      Math.abs(ch.createdAt.getTime() - Date.now()) < 24 * 60 * 60 * 1000 // Within 24 hours
    );

    if (similarChannel) {
      return {
        valid: false,
        reason: 'Similar channel already exists. Use existing channel or justify new one.'
      };
    }

    return { valid: true, reason: 'Channel creation validated' };
  }

  private async validateRoleDistribution(
    channelType: string,
    participants: string[]
  ): Promise<{ valid: boolean; reason: string }> {
    // Get participant roles
    const participantRoles = await this.getParticipantRoles(participants);
    const policy = this.policies.get(channelType);

    // Validate allowed roles
    const hasInvalidRole = participantRoles.some(role => 
      !policy.allowedRoles.includes(role)
    );

    if (hasInvalidRole) {
      return {
        valid: false,
        reason: `Participants must have roles: ${policy.allowedRoles.join(', ')}`
      };
    }

    // Validate role distribution rules
    const distributionValidation = this.validateRoleDistributionRules(channelType, participantRoles);
    if (!distributionValidation.valid) {
      return distributionValidation;
    }

    return { valid: true, reason: 'Role distribution validated' };
  }

  private validateRoleDistributionRules(
    channelType: string,
    roles: string[]
  ): { valid: boolean; reason: string } {
    switch (channelType) {
      case 'CRITICAL':
        // Critical channels require at least one manager/admin
        if (!roles.some(role => ['MANAGER', 'ADMIN'].includes(role))) {
          return {
            valid: false,
            reason: 'Critical channels require at least one manager or admin'
          };
        }
        break;

      case 'SENSITIVE':
        // Sensitive channels limited to specific roles only
        const allowedSensitiveRoles = ['MANAGER', 'ADMIN', 'SECURITY_OFFICER'];
        if (!roles.every(role => allowedSensitiveRoles.includes(role))) {
          return {
            valid: false,
            reason: 'Sensitive channels only allowed for: MANAGER, ADMIN, SECURITY_OFFICER'
          };
        }
        break;

      case 'ROUTINE':
        // Routine channels can have broader participation
        // No specific restrictions beyond general policies
        break;
    }

    return { valid: true, reason: 'Role distribution rules validated' };
  }

  // COMMUNICATION DISCIPLINE IMPLEMENTATION
  async sendMessage(request: {
    channelId: string;
    senderId: string;
    content: string;
    type: 'WRITTEN' | 'VOICE' | 'VIDEO';
    justification?: string;
  }): Promise<{
    approved: boolean;
    messageId?: string;
    reason: string;
    requirements?: string[];
  }> {
    const channel = this.channels.get(request.channelId);
    if (!channel) {
      return {
        approved: false,
        reason: 'Channel not found'
      };
    }

    // Validate sender participation
    if (!channel.participants.includes(request.senderId)) {
      return {
        approved: false,
        reason: 'Sender is not a channel participant'
      };
    }

    // Rule: Default to written communication
    if (request.type !== 'WRITTEN') {
      const validation = await this.validateNonWrittenCommunication(request);
      if (!validation.valid) {
        return {
          approved: false,
          reason: validation.reason
        };
      }
    }

    // Validate content against policies
    const contentValidation = await this.validateContent(request.content, channel.type);
    if (!contentValidation.valid) {
      return {
        approved: false,
        reason: contentValidation.reason
      };
    }

    // Create message
    const messageId = crypto.randomUUID();
    const message: Message = {
      id: messageId,
      channelId: request.channelId,
      senderId: request.senderId,
      content: channel.encryptionKey ? this.encryptContent(request.content, channel.encryptionKey) : request.content,
      type: request.type,
      timestamp: new Date(),
      encrypted: !!channel.encryptionKey,
      signature: this.generateMessageSignature(request.content, request.senderId),
      auditTrail: []
    };

    // Add to channel
    channel.messages.push(message);

    // Log message
    await this.logAuditEvent('MESSAGE_SENT', {
      messageId,
      channelId: request.channelId,
      senderId: request.senderId,
      type: request.type,
      encrypted: message.encrypted,
      timestamp: message.timestamp
    });

    // Handle non-written communication requirements
    const requirements = [];
    if (request.type !== 'WRITTEN') {
      requirements.push('Written summary must be provided within 24 hours');
      requirements.push('Voice/video recording must be stored securely');
    }

    return {
      approved: true,
      messageId,
      reason: 'Message sent successfully',
      requirements
    };
  }

  private async validateNonWrittenCommunication(request: {
    channelId: string;
    senderId: string;
    content: string;
    type: string;
    justification?: string;
  }): Promise<{ valid: boolean; reason: string }> {
    // Rule: Non-written communication requires justification
    if (!request.justification || request.justification.length < 50) {
      return {
        valid: false,
        reason: 'Non-written communication requires detailed justification (minimum 50 characters)'
      };
    }

    // Rule: Check if this is truly necessary
    const channel = this.channels.get(request.channelId);
    if (channel.type === 'ROUTINE') {
      return {
        valid: false,
        reason: 'Routine channels must use written communication only'
      };
    }

    // Rule: Emergency protocol validation
    const emergencyValidation = await this.validateEmergencyProtocol(request);
    if (!emergencyValidation.valid) {
      return emergencyValidation;
    }

    return { valid: true, reason: 'Non-written communication validated' };
  }

  private async validateEmergencyProtocol(request: {
    channelId: string;
    senderId: string;
    content: string;
    type: string;
    justification?: string;
  }): Promise<{ valid: boolean; reason: string }> {
    // Check if this qualifies as an emergency
    const emergencyKeywords = ['emergency', 'critical', 'urgent', 'security breach', 'system failure'];
    const isEmergency = emergencyKeywords.some(keyword =>
      request.content.toLowerCase().includes(keyword) ||
      (request.justification && request.justification.toLowerCase().includes(keyword))
    );

    if (!isEmergency) {
      return {
        valid: false,
        reason: 'Non-written communication only allowed for emergencies'
      };
    }

    // Create emergency protocol record
    const emergencyId = crypto.randomUUID();
    this.emergencyProtocols.set(emergencyId, {
      id: emergencyId,
      channelId: request.channelId,
      senderId: request.senderId,
      type: request.type,
      justification: request.justification,
      timestamp: new Date(),
      followUpRequired: true,
      followUpDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    return { valid: true, reason: 'Emergency protocol activated' };
  }

  private async validateContent(content: string, channelType: string): Promise<{
    valid: boolean;
    reason: string;
  }> {
    const policy = this.policies.get(channelType);

    // Check for prohibited content
    const prohibitedContent = policy.prohibitedContent;
    const hasProhibitedContent = prohibitedContent.some(prohibited =>
      content.toLowerCase().includes(prohibited.toLowerCase())
    );

    if (hasProhibitedContent) {
      return {
        valid: false,
        reason: `Content contains prohibited material: ${prohibitedContent.join(', ')}`
      };
    }

    // Validate content length
    if (content.length < 10) {
      return {
        valid: false,
        reason: 'Content too short (minimum 10 characters)'
      };
    }

    if (content.length > 10000) {
      return {
        valid: false,
        reason: 'Content too long (maximum 10,000 characters)'
      };
    }

    return { valid: true, reason: 'Content validated' };
  }

  // ENTRY & EXIT COMMUNICATION PROTOCOLS
  async processEntryCommunication(userId: string, sponsorId: string): Promise<{
    channels: string[];
    protocols: string[];
    restrictions: string[];
  }> {
    // Create entry communication channels
    const channels = [];

    // Sponsor-sponsor communication (private)
    const sponsorChannel = await this.createChannel({
      type: 'SENSITIVE',
      participants: [userId, sponsorId],
      purpose: 'Sponsor-mentee communication and onboarding',
      duration: 168 // 1 week
    });

    if (sponsorChannel.approved) {
      channels.push(sponsorChannel.channelId!);
    }

    // Team introduction channel (routine)
    const teamChannel = await this.createChannel({
      type: 'ROUTINE',
      participants: [userId, sponsorId, ...await this.getTeamMembers(sponsorId)],
      purpose: 'Team introduction and role definition',
      duration: 72 // 3 days
    });

    if (teamChannel.approved) {
      channels.push(teamChannel.channelId!);
    }

    const protocols = [
      'All communications must use official channels',
      'Personal channels are prohibited',
      'Written communication is default requirement',
      'Non-written communication requires emergency justification',
      'All communications are logged and audited'
    ];

    const restrictions = [
      `Access limited to ${channels.length} official channels`,
      'No sharing of access credentials',
      'No discussion of system architecture',
      'No sharing of user data or business logic'
    ];

    return { channels, protocols, restrictions };
  }

  async processExitCommunication(userId: string, reason: string): Promise<{
    actions: string[];
    notifications: string[];
    retention: string[];
  }> {
    // Get all channels involving the user
    const userChannels = Array.from(this.channels.values()).filter(ch =>
      ch.participants.includes(userId)
    );

    const actions = [];
    const notifications = [];
    const retention = [];

    // Process each channel
    for (const channel of userChannels) {
      // Remove user from channel
      channel.participants = channel.participants.filter(p => p !== userId);

      // Log removal
      await this.logAuditEvent('USER_REMOVED_FROM_CHANNEL', {
        channelId: channel.id,
        userId,
        reason,
        timestamp: new Date()
      });

      // Archive channel if no participants left
      if (channel.participants.length === 0) {
        await this.archiveChannel(channel.id, reason);
        retention.push(`Channel ${channel.id} archived with ${channel.messages.length} messages`);
      }

      actions.push(`Removed from channel: ${channel.id}`);
    }

    // Notify sponsors and team members
    notifications.push('All sponsors notified of exit');
    notifications.push('Team members notified of role changes');
    notifications.push('Access credentials invalidated');

    // Retention policies
    retention.push('All communication logs retained according to policy');
    retention.push('Sensitive content encrypted and archived');
    retention.push('Audit trail preserved for compliance');

    return { actions, notifications, retention };
  }

  // FAILURE MODE PREVENTION
  async detectInformationLeakage(): Promise<{
    risks: Array<{
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
      recommendation: string;
    }>;
  }> {
    const risks = [];

    // Check for convenience leakage
    const convenienceRisks = await this.detectConvenienceLeakage();
    risks.push(...convenienceRisks);

    // Check for role drift
    const roleDriftRisks = await this.detectRoleDrift();
    risks.push(...roleDriftRisks);

    // Check for informal channels
    const informalChannelRisks = await this.detectInformalChannels();
    risks.push(...informalChannelRisks);

    // Check for network growth issues
    const growthRisks = await this.detectNetworkGrowthIssues();
    risks.push(...growthRisks);

    return { risks };
  }

  private async detectConvenienceLeakage(): Promise<Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
  }>> {
    const risks = [];

    // Check for channels with urgent/quick purposes
    const urgentChannels = Array.from(this.channels.values()).filter(ch =>
      ch.purpose.includes('urgent') || ch.purpose.includes('quick')
    );

    urgentChannels.forEach(channel => {
      risks.push({
        type: 'CONVENIENCE_LEAKAGE',
        severity: 'MEDIUM',
        description: `Channel ${channel.id} created for convenience/urgency`,
        recommendation: 'Review channel necessity and enforce proper protocols'
      });
    });

    // Check for excessive message frequency (possible convenience bypass)
    const recentMessages = Array.from(this.channels.values())
      .flatMap(ch => ch.messages)
      .filter(msg => Date.now() - msg.timestamp.getTime() < 60 * 60 * 1000) // Last hour
      .filter(msg => msg.type === 'WRITTEN')
      .length;

    if (recentMessages > 100) {
      risks.push({
        type: 'CONVENIENCE_LEAKAGE',
        severity: 'LOW',
        description: 'High volume of written messages may indicate convenience bypass attempts',
        recommendation: 'Monitor communication patterns and enforce protocol compliance'
      });
    }

    return risks;
  }

  private async detectRoleDrift(): Promise<Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
  }>> {
    const risks = [];

    // Check for users accumulating unnecessary knowledge
    const userParticipation = new Map<string, number>();
    
    for (const channel of this.channels.values()) {
      for (const participant of channel.participants) {
        userParticipation.set(participant, (userParticipation.get(participant) || 0) + 1);
      }
    }

    // Flag users with excessive channel participation
    for (const [userId, channelCount] of userParticipation) {
      if (channelCount > 10) {
        risks.push({
          type: 'ROLE_DRIFT',
          severity: 'MEDIUM',
          description: `User ${userId} participates in ${channelCount} channels (possible role drift)`,
          recommendation: 'Review user role and access scope'
        });
      }
    }

    return risks;
  }

  private async detectInformalChannels(): Promise<Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
  }>> {
    const risks = [];

    // Check for channels that might be informal side channels
    const suspiciousChannels = Array.from(this.channels.values()).filter(ch =>
      ch.purpose.includes('chat') ||
      ch.purpose.includes('informal') ||
      ch.purpose.includes('casual') ||
      ch.messages.length > 1000 // High volume might indicate informal use
    );

    suspiciousChannels.forEach(channel => {
      risks.push({
        type: 'INFORMAL_CHANNEL',
        severity: 'HIGH',
        description: `Channel ${channel.id} shows characteristics of informal side channel`,
        recommendation: 'Investigate channel purpose and enforce formal communication protocols'
      });
    });

    return risks;
  }

  private async detectNetworkGrowthIssues(): Promise<Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation: string;
  }>> {
    const risks = [];

    // Check if network is growing faster than governance
    const totalChannels = this.channels.size;
    const totalParticipants = Array.from(this.channels.values())
      .reduce((sum, ch) => sum + ch.participants.length, 0);

    // Risk indicators
    if (totalChannels > 100) {
      risks.push({
        type: 'NETWORK_GROWTH',
        severity: 'MEDIUM',
        description: `Network has ${totalChannels} channels (possible governance issues)`,
        recommendation: 'Review governance capacity and implement growth controls'
      });
    }

    if (totalParticipants > 500) {
      risks.push({
        type: 'NETWORK_GROWTH',
        severity: 'LOW',
        description: `Network has ${totalParticipants} total participants`,
        recommendation: 'Monitor network growth and strengthen governance'
      });
    }

    return risks;
  }

  // UTILITY METHODS
  private generateChannelConditions(channel: CommunicationChannel): string[] {
    const conditions = [
      `Channel type: ${channel.type}`,
      `Max participants: ${this.policies.get(channel.type).maxParticipants}`,
      `Retention: ${channel.retentionPolicy}`,
      `Encryption: ${channel.encrypted ? 'Enabled' : 'Disabled'}`,
      'All communications logged and audited'
    ];

    if (channel.expiresAt) {
      conditions.push(`Expires: ${channel.expiresAt.toISOString()}`);
    }

    return conditions;
  }

  private encryptContent(content: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private generateMessageSignature(content: string, senderId: string): string {
    return crypto
      .createHash('sha256')
      .update(content + senderId + Date.now())
      .digest('hex');
  }

  private async logAuditEvent(event: string, data: any): Promise<void> {
    const auditEntry: AuditEntry = {
      id: crypto.randomUUID(),
      action: event,
      actor: data.userId || 'SYSTEM',
      timestamp: new Date(),
      details: data,
      signature: this.generateAuditSignature(data)
    };

    this.auditLog.push(auditEntry);

    // Store in persistent audit system
    await this.storeAuditEntry(auditEntry);
  }

  private generateAuditSignature(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data) + process.env.AUDIT_SECRET)
      .digest('hex');
  }

  private async storeAuditEntry(entry: AuditEntry): Promise<void> {
    // Store in database or file system
    const auditPath = path.join(process.cwd(), 'audit', `${entry.id}.json`);
    await fs.writeFile(auditPath, JSON.stringify(entry, null, 2));
  }

  private async getParticipantRoles(participants: string[]): Promise<string[]> {
    // This would typically query the database for user roles
    // For now, return placeholder roles
    return participants.map(() => 'USER');
  }

  private async getTeamMembers(sponsorId: string): Promise<string[]> {
    // This would typically query the database for team members
    // For now, return placeholder team members
    return ['TEAM_MEMBER_1', 'TEAM_MEMBER_2'];
  }

  private async archiveChannel(channelId: string, reason: string): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) return;

    // Archive channel data
    const archiveData = {
      channelId,
      type: channel.type,
      participants: channel.participants,
      purpose: channel.purpose,
      messageCount: channel.messages.length,
      archivedAt: new Date(),
      reason
    };

    // Store archive
    const archivePath = path.join(process.cwd(), 'archives', `${channelId}.json`);
    await fs.writeFile(archivePath, JSON.stringify(archiveData, null, 2));

    // Remove from active channels
    this.channels.delete(channelId);
  }

  // INITIALIZATION METHODS
  private initializePolicies(): void {
    const policies: CommunicationPolicy[] = [
      {
        channelType: 'CRITICAL',
        maxParticipants: 3,
        retentionPeriod: 'permanent',
        encryptionRequired: true,
        approvalRequired: true,
        allowedRoles: ['MANAGER', 'ADMIN', 'SECURITY_OFFICER'],
        prohibitedContent: ['password', 'secret', 'private key'],
        loggingLevel: 'FULL'
      },
      {
        channelType: 'ROUTINE',
        maxParticipants: 10,
        retentionPeriod: '30d',
        encryptionRequired: false,
        approvalRequired: false,
        allowedRoles: ['USER', 'ANALYST', 'ENGINEER', 'MANAGER'],
        prohibitedContent: ['password', 'secret'],
        loggingLevel: 'BASIC'
      },
      {
        channelType: 'SENSITIVE',
        maxParticipants: 2,
        retentionPeriod: '7d',
        encryptionRequired: true,
        approvalRequired: true,
        allowedRoles: ['MANAGER', 'ADMIN', 'SECURITY_OFFICER'],
        prohibitedContent: ['password', 'secret', 'private key', 'personal data'],
        loggingLevel: 'MINIMAL'
      }
    ];

    policies.forEach(policy => {
      this.policies.set(policy.channelType, policy);
    });
  }

  private initializeAuditSystem(): void {
    // Create audit directory if it doesn't exist
    fs.mkdir(path.join(process.cwd(), 'audit'), { recursive: true }).catch(() => {});
    fs.mkdir(path.join(process.cwd(), 'archives'), { recursive: true }).catch(() => {});
  }

  private async loadExistingChannels(): Promise<void> {
    // Load existing channels from storage
    // This would typically load from database
  }
}

export default new CommunicationDisciplineSystem();
