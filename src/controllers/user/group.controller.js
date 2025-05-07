"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveGroup = exports.joinGroup = exports.createGroup = void 0;
const group_model_1 = __importDefault(require("../../models/group.model"));
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const userId = req.user.id; // Assuming you have authentication middleware
        const group = yield group_model_1.default.create({
            name,
            description,
            createdBy: userId,
            members: [userId]
        });
        res.status(201).json(group);
    }
    catch (err) {
        logger_utils_1.default.error('Create group error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createGroup = createGroup;
const joinGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const group = yield group_model_1.default.findById(groupId);
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        if (group.members.includes(userId)) {
            res.status(400).json({ message: 'Already a member' });
            return;
        }
        group.members.push(userId);
        yield group.save();
        res.status(200).json({ message: 'Joined group successfully' });
    }
    catch (err) {
        logger_utils_1.default.error('Join group error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.joinGroup = joinGroup;
/**
 * Leave a group
 */
const leaveGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        // Find the group
        const group = yield group_model_1.default.findById(groupId);
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
        yield group.save();
        res.status(200).json({ message: 'Successfully left the group' });
    }
    catch (err) {
        logger_utils_1.default.error('Leave group error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.leaveGroup = leaveGroup;
