import { Request, Response } from 'express';
import Group from '../../models/group.model';
import logger from '../../utils/logger.utils';

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const userId = (req as any).user.id; // Assuming you have authentication middleware
        
        const group = await Group.create({
            name,
            description,
            createdBy: userId,
            members: [userId]
        });
        
        res.status(201).json(group);
    } catch (err) {
        logger.error('Create group error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const joinGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const userId = (req as any).user.id;
        
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return
        }
        
        if (group.members.includes(userId)) {
            res.status(400).json({ message: 'Already a member' });
            return
        }
        
        group.members.push(userId);
        await group.save();
        
        res.status(200).json({ message: 'Joined group successfully' });
    } catch (err) {
        logger.error('Join group error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};




/**
 * Leave a group
 */
export const leaveGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const userId = (req as any).user._id;

        // Find the group
        const group = await Group.findById(groupId);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }

        // Check if user is a member
        if (!group.members.includes(userId)) {
            res.status(400).json({ message: 'You are not a member of this group' });
            return;
        }

        // Remove user from members array
        group.members = group.members.filter(member => !member.equals(userId));
        await group.save();

        res.status(200).json({ message: 'Successfully left the group' });
    } catch (err) {
        logger.error('Leave group error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};